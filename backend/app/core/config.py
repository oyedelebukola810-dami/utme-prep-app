import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "UTME Preparation & CBT Platform API"
    API_V1_STR: str = "/api/v1"
    
    # Core Application Secrets & URLs
    SECRET_KEY: str = os.getenv("SECRET_KEY", "utme_2026_production_secret_key_984712398471")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "utme_jwt_secret_key_2026_secure_hash_897123")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")) # 7 days
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # OWASP Email Delivery & Verification Configuration
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "noreply@utmeprep.ng")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "UTME Prep 2026 Engine")
    EMAIL_TEST_MODE: str = os.getenv("EMAIL_TEST_MODE", "dev_log") # "smtp" or "dev_log"
    
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 2
    RESEND_COOLDOWN_SECONDS: int = 60
    
    # PostgreSQL Configuration
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "utme_cbt_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

settings = Settings()
