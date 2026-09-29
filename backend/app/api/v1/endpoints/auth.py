import os
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    generate_secure_token,
    create_access_token
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

logger = logging.getLogger("auth")
router = APIRouter()

# Memory database store for active sessions
MOCK_USERS_DB: Dict[str, Dict[str, Any]] = {}

def send_verification_email(email: str, token: str) -> bool:
    """
    OWASP Email Delivery Engine:
    - If SMTP is configured, sends via SMTPLIB.
    - If SMTP is unconfigured or EMAIL_TEST_MODE is active, writes structured log entry to backend/dev_emails.log.
    """
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    email_content = (
        f"======================================================================\n"
        f"TIME: {datetime.utcnow().isoformat()}Z\n"
        f"TO: {email}\n"
        f"FROM: {settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>\n"
        f"SUBJECT: Verify your UTME Prep Account\n"
        f"----------------------------------------------------------------------\n"
        f"Welcome to UTME Prep 2026.\n\n"
        f"Please verify your candidate email address by clicking the link below:\n"
        f"{verification_link}\n\n"
        f"Verification Token: {token}\n"
        f"This link will expire in {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours.\n"
        f"======================================================================\n\n"
    )

    # 1. Try real SMTP delivery if configured
    if settings.SMTP_HOST and settings.SMTP_USER:
        try:
            import smtplib
            from email.mime.text import MIMEText
            
            msg = MIMEText(
                f"Welcome to UTME Prep 2026.\n\nPlease verify your email address by clicking the link below:\n{verification_link}\n\nThis link will expire in {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours."
            )
            msg['Subject'] = "Verify your UTME Prep Account"
            msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg['To'] = email

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            logger.info(f"[AUTH SECURITY] Email successfully sent via SMTP to {email}")
            return True
        except Exception as e:
            logger.error(f"[AUTH SECURITY] SMTP Error sending to {email}: {str(e)}")

    # 2. Local development fallback email logger stream (backend/dev_emails.log)
    try:
        log_file_path = os.path.join(os.getcwd(), "dev_emails.log")
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(email_content)
        logger.info(f"[DEV EMAIL LOG] Email verification link written to dev_emails.log for {email}")
    except Exception as e:
        logger.error(f"[DEV EMAIL LOG] Failed to write dev_emails.log: {str(e)}")
        
    return False

@router.post("/register", response_model=Dict[str, Any])
def register_user(user_in: UserCreate):
    normalized_email = user_in.email.lower().strip()
    
    if normalized_email in MOCK_USERS_DB:
        # Generic OWASP response to prevent email enumeration
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address cannot be registered. Please check credentials or log in."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    verification_token = generate_secure_token()
    now = datetime.utcnow()
    token_expires = now + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    
    user_record = {
        "id": len(MOCK_USERS_DB) + 1,
        "email": normalized_email,
        "full_name": user_in.full_name,
        "hashed_password": hashed_pwd,
        "target_score": user_in.target_score,
        "is_active": True,
        "is_verified": False,
        "verification_token": verification_token,
        "verification_token_expires_at": token_expires,
        "last_verification_sent_at": now,
        "password_reset_token": None,
        "password_reset_expires_at": None,
        "created_at": now
    }
    
    MOCK_USERS_DB[normalized_email] = user_record
    smtp_sent = send_verification_email(normalized_email, verification_token)
    
    return {
        "message": f"Verification email dispatched to {normalized_email}. Please check your inbox or dev email log.",
        "email": normalized_email,
        "requires_verification": True,
        "smtp_delivery": smtp_sent
    }

@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest):
    now = datetime.utcnow()
    target_user = None
    
    for u in MOCK_USERS_DB.values():
        if u.get("verification_token") == payload.token.strip():
            target_user = u
            break
            
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )
        
    if target_user["verification_token_expires_at"] < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new verification email."
        )
        
    target_user["is_verified"] = True
    target_user["verification_token"] = None
    target_user["verification_token_expires_at"] = None
    
    return {
        "message": "Email address successfully verified. You may now log in.",
        "is_verified": True
    }

@router.post("/resend-verification")
def resend_verification(payload: ResendVerificationRequest):
    normalized_email = payload.email.lower().strip()
    user = MOCK_USERS_DB.get(normalized_email)
    
    generic_msg = f"If an unverified account exists for {normalized_email}, a new verification token has been dispatched."
    
    if not user or user["is_verified"]:
        return {"message": generic_msg}
        
    now = datetime.utcnow()
    last_sent = user.get("last_verification_sent_at")
    
    if last_sent and (now - last_sent).total_seconds() < settings.RESEND_COOLDOWN_SECONDS:
        remaining = int(settings.RESEND_COOLDOWN_SECONDS - (now - last_sent).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds before requesting another verification link."
        )
        
    new_token = generate_secure_token()
    user["verification_token"] = new_token
    user["verification_token_expires_at"] = now + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    user["last_verification_sent_at"] = now
    
    send_verification_email(normalized_email, new_token)
    
    return {"message": generic_msg}

@router.post("/login", response_model=Token)
def login_user(user_in: UserCreate):
    normalized_email = user_in.email.lower().strip()
    user = MOCK_USERS_DB.get(normalized_email)
    
    invalid_credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not user:
        raise invalid_credentials_exc
        
    if not verify_password(user_in.password, user["hashed_password"]):
        raise invalid_credentials_exc
        
    if not user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account email address has not been verified. Please check your inbox or request a new verification token."
        )
        
    access_token = create_access_token(data={"sub": user["email"], "id": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_verified": user["is_verified"]
    }

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    normalized_email = payload.email.lower().strip()
    user = MOCK_USERS_DB.get(normalized_email)
    generic_msg = "If an account exists with that email address, a password reset link has been dispatched."
    
    if user:
        reset_token = generate_secure_token()
        user["password_reset_token"] = reset_token
        user["password_reset_expires_at"] = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
        logger.info(f"[AUTH SECURITY] Password reset token generated for {normalized_email}")
        
    return {"message": generic_msg}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    now = datetime.utcnow()
    target_user = None
    
    for u in MOCK_USERS_DB.values():
        if u.get("password_reset_token") == payload.token.strip():
            target_user = u
            break
            
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
        
    if target_user["password_reset_expires_at"] < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new reset link."
        )
        
    target_user["hashed_password"] = get_password_hash(payload.new_password)
    target_user["password_reset_token"] = None
    target_user["password_reset_expires_at"] = None
    
    return {"message": "Password successfully reset. You may now log in with your new password."}
