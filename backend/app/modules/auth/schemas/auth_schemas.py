"""Authentication request/response schemas (DTOs)."""
from __future__ import annotations

from pydantic import EmailStr, Field, model_validator

from app.modules.users.schemas.user_schemas import UserPublic
from app.shared.schemas import BaseSchema


class RegisterRequest(BaseSchema):
    full_name: str = Field(min_length=1, max_length=120)
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-z][a-z0-9]{2,19}$")
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20, pattern=r"^\+?[0-9\s\-()]{7,20}$")
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseSchema):
    identifier: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=1, max_length=128)


class TokenPair(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResult(BaseSchema):
    """Returned on successful login / registration."""

    user: UserPublic
    tokens: TokenPair


class RefreshRequest(BaseSchema):
    refresh_token: str


class LogoutRequest(BaseSchema):
    refresh_token: str


class ForgotPasswordRequest(BaseSchema):
    email: EmailStr


class ResetPasswordRequest(BaseSchema):
    token: str
    new_password: str = Field(min_length=6, max_length=128)
    confirm_new_password: str = Field(min_length=6, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match.")
        return self


class VerifyEmailRequest(BaseSchema):
    token: str
