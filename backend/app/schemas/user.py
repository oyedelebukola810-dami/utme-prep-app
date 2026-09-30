from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    target_score: Optional[int] = 320

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_admin: bool = False
    cbt_timer_mode: Optional[str] = "120"
    auto_show_solutions: Optional[bool] = True
    notifications_enabled: Optional[bool] = True
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_verified: bool
    is_admin: bool = False
    user: Optional[UserResponse] = None

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdateUserSettingsRequest(BaseModel):
    full_name: Optional[str] = None
    target_score: Optional[int] = None
    cbt_timer_mode: Optional[str] = None
    auto_show_solutions: Optional[bool] = None
    notifications_enabled: Optional[bool] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
