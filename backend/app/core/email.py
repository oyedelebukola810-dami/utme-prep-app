import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any, Tuple

from app.core.config import settings

logger = logging.getLogger("email_service")

def dispatch_verification_email(email: str, token: str) -> Tuple[bool, str, str]:
    """
    Production-Minded Email Dispatch Service.
    
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

    # 1. Production Real SMTP Provider Transport
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = email
            msg.attach(MIMEText(body_text, "plain"))

            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                server.starttls()
                
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"[SMTP SUCCESS] Verification email accepted by provider for {email}")
            return True, "DELIVERED_VIA_SMTP", f"Verification email successfully delivered to {email}."
        except Exception as e:
            logger.error(f"[SMTP FAILURE] SMTP transport error for {email}: {str(e)}")
            return False, "FAILED", f"SMTP provider error: Unable to deliver verification email to {email}."

    # 2. Local Development Safe Email Testing Strategy (dev_emails.log stream)
    log_entry = (
        f"======================================================================\n"
        f"DISPATCH TIMESTAMP: {datetime.utcnow().isoformat()}Z\n"
        f"RECIPIENT: {email}\n"
        f"SENDER: {settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>\n"
        f"SUBJECT: {subject}\n"
        f"----------------------------------------------------------------------\n"
        f"{body_text}"
        f"======================================================================\n\n"
    )
    
    try:
        log_file_path = os.path.join(os.getcwd(), "dev_emails.log")
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
        logger.info(f"[DEV EMAIL STREAM] Local email stream entry recorded for {email}")
        return True, "LOCAL_DEV_STREAM", f"Verification email recorded in local dev stream for {email} (SMTP unconfigured)."
    except Exception as e:
        logger.error(f"[DEV EMAIL LOG ERROR] Failed to write dev_emails.log: {str(e)}")
        return False, "FAILED", "Failed to record local development verification email."
