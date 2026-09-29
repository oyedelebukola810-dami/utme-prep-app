from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    target_score = Column(Integer, default=320)
    
    # User Preferences & Settings (Persisted in DB)
    cbt_timer_mode = Column(String(20), default="120") # "120" or "untimed"
    auto_show_solutions = Column(Boolean, default=True)
    notifications_enabled = Column(Boolean, default=True)
    
    # OWASP Email Verification & Security Fields
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True, index=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    last_verification_sent_at = Column(DateTime(timezone=True), nullable=True)
    
    # Password Reset Fields
    password_reset_token = Column(String(255), nullable=True, index=True)
    password_reset_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
