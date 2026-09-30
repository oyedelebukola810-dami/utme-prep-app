import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Tuple

from app.core.config import settings

logger = logging.getLogger("email_service")

def dispatch_verification_email(email: str, token: str) -> Tuple[bool, str, str]:
    """
    Production Email Dispatch Service for Account Verification.
    
    Returns:
        (success: bool, status_code: str, user_facing_message: str)
        status_code: "DELIVERED_VIA_SMTP" | "LOCAL_DEV_STREAM" | "FAILED"
    """
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    subject = "Verify your UTME Prep Account"
    body_text = (
        f"Welcome to UTME Prep 2026.\n\n"
        f"Please verify your candidate email address by clicking the link below:\n"
        f"{verification_link}\n\n"
        f"Or enter your verification token: {token}\n\n"
        f"This verification token will expire in {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours.\n"
    )

    return _send_or_log_email(email, subject, body_text, verification_link)

def dispatch_password_reset_email(email: str, token: str) -> Tuple[bool, str, str]:
    """
    Production Email Dispatch Service for Password Reset.
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Reset your UTME Prep Account Password"
    body_text = (
        f"UTME Prep Account Password Reset Request.\n\n"
        f"Click the link below to reset your password:\n"
        f"{reset_link}\n\n"
        f"Or use your password reset token: {token}\n\n"
        f"This reset link will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS} hours.\n"
    )

    return _send_or_log_email(email, subject, body_text, reset_link)

def _send_or_log_email(email: str, subject: str, body_text: str, action_link: str) -> Tuple[bool, str, str]:
    # 1. Production SMTP Transport
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            logger.info(f"[SMTP DIAGNOSTIC] Initiating connection to {settings.SMTP_HOST}:{settings.SMTP_PORT} for recipient domain '{email.split('@')[-1]}'")
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = email
            msg.attach(MIMEText(body_text, "plain"))

            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
                server.starttls()
                
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"[SMTP SUCCESS] Email accepted by SMTP provider for {email.split('@')[0]}***@{email.split('@')[-1]}")
            return True, "DELIVERED_VIA_SMTP", f"Email successfully accepted by SMTP provider for {email}."
        except smtplib.SMTPAuthenticationError:
            logger.error(f"[SMTP AUTH FAILURE] Invalid SMTP credentials for provider {settings.SMTP_HOST}")
            return False, "FAILED", "SMTP Provider Authentication Error: Unable to authenticate with email gateway."
        except Exception as e:
            logger.error(f"[SMTP ERROR] Transport failure: {type(e).__name__}")
            return False, "FAILED", f"SMTP Provider Error: Unable to deliver email to {email}."

    # 2. Local Development Safe Email Stream (dev_emails.log)
    log_entry = (
        f"======================================================================\n"
        f"DISPATCH TIMESTAMP: {datetime.utcnow().isoformat()}Z\n"
        f"RECIPIENT: {email}\n"
        f"SENDER: {settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>\n"
        f"SUBJECT: {subject}\n"
        f"ACTION LINK: {action_link}\n"
        f"----------------------------------------------------------------------\n"
        f"{body_text}"
        f"======================================================================\n\n"
    )
    
    try:
        log_file_path = os.path.join(os.getcwd(), "dev_emails.log")
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
        logger.info(f"[DEV EMAIL STREAM] Local email stream entry recorded for {email.split('@')[0]}***@{email.split('@')[-1]}")
        return True, "LOCAL_DEV_STREAM", f"Email recorded in local dev stream for {email} (SMTP unconfigured)."
    except Exception as e:
        logger.error(f"[DEV EMAIL STREAM ERROR] Could not write to dev_emails.log: {str(e)}")
        return False, "FAILED", "Failed to record local development email."
