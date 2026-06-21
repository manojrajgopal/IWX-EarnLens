"""Public API schemas (DTOs) for the users module."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field, model_validator

from app.core.constants import UserRole
from app.shared.schemas import BaseSchema


class UserPublic(BaseSchema):
    """User representation safe to return to clients (no secrets)."""

    id: str
    email: EmailStr
    username: Optional[str] = None
    full_name: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    avatar_url: Optional[str] = None
    default_currency: str = "USD"
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class UserUpdate(BaseSchema):
    """Editable profile fields."""

    full_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    avatar_url: Optional[str] = None
    default_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)


class PasswordChange(BaseSchema):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)
    confirm_new_password: str = Field(min_length=6, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> "PasswordChange":
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match.")
        return self
