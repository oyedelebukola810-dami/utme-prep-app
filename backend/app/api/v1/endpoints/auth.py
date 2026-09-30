import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.email import dispatch_verification_email, dispatch_password_reset_email
from app.core.security import (
    get_password_hash,
    verify_password,
    generate_secure_token,
    create_access_token
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateUserSettingsRequest,
    ChangePasswordRequest
)

logger = logging.getLogger("auth_api")
router = APIRouter()

@router.post("/register", response_model=Dict[str, Any])
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    normalized_email = user_in.email.lower().strip()
    
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        # OWASP Generic error response to mitigate email enumeration
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address cannot be registered. Please check credentials or sign in."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    verification_token = generate_secure_token()
    now = datetime.utcnow()
    token_expires = now + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    
    db_user = User(
        email=normalized_email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        target_score=user_in.target_score,
        is_active=True,
        is_verified=False,
        verification_token=verification_token,
        verification_token_expires_at=token_expires,
        last_verification_sent_at=now
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    success, status_code, delivery_message = dispatch_verification_email(normalized_email, verification_token)
    
    return {
        "message": delivery_message,
        "email": normalized_email,
        "requires_verification": True,
        "delivery_status": status_code
    }

@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    clean_token = payload.token.strip()
    
    user = db.query(User).filter(User.verification_token == clean_token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )
        
    if user.verification_token_expires_at and user.verification_token_expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new verification email."
        )
        
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()
    
    return {
        "message": "Email address successfully verified. You may now log in.",
        "is_verified": True
    }

@router.post("/resend-verification")
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    
    generic_msg = f"If an unverified account exists for {normalized_email}, a new verification token has been dispatched."
    
    if not user or user.is_verified:
        return {"message": generic_msg}
        
    now = datetime.utcnow()
    if user.last_verification_sent_at:
        elapsed = (now - user.last_verification_sent_at).total_seconds()
        if elapsed < settings.RESEND_COOLDOWN_SECONDS:
            remaining = int(settings.RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another verification email."
            )
            
    new_token = generate_secure_token()
    user.verification_token = new_token
    user.verification_token_expires_at = now + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    user.last_verification_sent_at = now
    db.commit()
    
    dispatch_verification_email(normalized_email, new_token)
    return {"message": generic_msg}

@router.post("/login", response_model=Token)
def login_user(user_in: UserCreate, db: Session = Depends(get_db)):
    normalized_email = user_in.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    
    invalid_credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not user:
        raise invalid_credentials_exc
        
    if not verify_password(user_in.password, user.hashed_password):
        raise invalid_credentials_exc
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account email address has not been verified. Please check your inbox or request a new verification token."
        )
        
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_verified": user.is_verified
    }

@router.post("/settings", response_model=Dict[str, Any])
def update_user_settings(payload: UpdateUserSettingsRequest, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Candidate user record not found.")
        
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.target_score is not None:
        user.target_score = payload.target_score
    if payload.cbt_timer_mode is not None:
        user.cbt_timer_mode = payload.cbt_timer_mode
    if payload.auto_show_solutions is not None:
        user.auto_show_solutions = payload.auto_show_solutions
    if payload.notifications_enabled is not None:
        user.notifications_enabled = payload.notifications_enabled
        
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Candidate settings successfully updated and persisted to database.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "target_score": user.target_score,
            "cbt_timer_mode": user.cbt_timer_mode,
            "auto_show_solutions": user.auto_show_solutions,
            "notifications_enabled": user.notifications_enabled
        }
    }

@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Candidate record not found.")
        
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password entered is incorrect.")
        
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password successfully updated in persistent database."}

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    generic_msg = "If an account exists with that email address, a password reset link has been dispatched."
    
    if user:
        reset_token = generate_secure_token()
        user.password_reset_token = reset_token
        user.password_reset_expires_at = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
        db.commit()
        
        dispatch_password_reset_email(normalized_email, reset_token)
        logger.info(f"[AUTH SECURITY] Password reset email dispatched for {normalized_email.split('@')[0]}***@{normalized_email.split('@')[-1]}")
        
    return {"message": generic_msg}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    user = db.query(User).filter(User.password_reset_token == payload.token.strip()).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
        
    if user.password_reset_expires_at and user.password_reset_expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new reset link."
        )
        
    user.hashed_password = get_password_hash(payload.new_password)
    user.password_reset_token = None
    user.password_reset_expires_at = None
    db.commit()
    
    return {"message": "Password successfully reset. You may now log in with your new password."}

@router.get("/dev-email-stream")
def get_dev_email_stream():
    """Development route to inspect local verification email stream when DEBUG=True"""
    if not settings.DEBUG:
        raise HTTPException(status_code=403, detail="Development email stream is disabled in production.")
        
    log_file_path = os.path.join(os.getcwd(), "dev_emails.log")
    if not os.path.exists(log_file_path):
        return {"stream": "No local emails dispatched yet."}
        
    with open(log_file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return {"stream": content}
