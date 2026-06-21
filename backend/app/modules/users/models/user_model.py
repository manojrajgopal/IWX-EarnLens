"""Internal domain model for a user document."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.core.constants import UserRole


class UserModel(BaseModel):
    """Shape of a user document stored in MongoDB."""

    email: EmailStr
    username: str
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_email_verified: bool = False
    avatar_url: Optional[str] = None
    default_currency: str = "USD"
    email_verify_token: Optional[str] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
