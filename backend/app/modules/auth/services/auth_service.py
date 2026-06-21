"""Authentication business logic: registration, login, token lifecycle."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError

from app.core.config import settings
from app.core.constants import TokenType, UserRole
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    token_expiry,
    verify_password,
)
from app.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)
from app.modules.auth.schemas.auth_schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
)
from app.modules.auth.validators.password_validator import validate_password_strength
from app.modules.users.repositories.user_repository import UserRepository


class AuthService:
    """Coordinates authentication use cases and token management."""

    def __init__(
        self,
        user_repository: UserRepository,
        token_repository: RefreshTokenRepository,
    ) -> None:
        self.users = user_repository
        self.tokens = token_repository

    # ------------------------------------------------------------------ #
    # Registration & login
    # ------------------------------------------------------------------ #
    async def register(self, payload: RegisterRequest) -> Dict[str, Any]:
        validate_password_strength(payload.password)
        existing = await self.users.get_by_email(payload.email)
        if existing:
            raise ConflictError("An account with this email already exists.")

        user = await self.users.create(
            {
                "email": payload.email.lower(),
                "hashed_password": hash_password(payload.password),
                "full_name": payload.full_name.strip(),
                "role": UserRole.USER.value,
                "is_active": True,
                "is_email_verified": False,
                "default_currency": settings.DEFAULT_CURRENCY,
                "email_verify_token": secrets.token_urlsafe(32),
            }
        )
        tokens = await self._issue_tokens(user["id"], user["email"])
        return {"user": user, "tokens": tokens}

    async def login(self, payload: LoginRequest) -> Dict[str, Any]:
        user = await self.users.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user["hashed_password"]):
            raise UnauthorizedError("Invalid email or password.")
        if not user.get("is_active", False):
            raise UnauthorizedError("This account has been deactivated.")

        await self.users.update(user["id"], {"last_login_at": datetime.now(timezone.utc)})
        tokens = await self._issue_tokens(user["id"], user["email"])
        user = await self.users.get_by_id(user["id"])
        return {"user": user, "tokens": tokens}

    # ------------------------------------------------------------------ #
    # Token lifecycle
    # ------------------------------------------------------------------ #
    async def refresh(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token, TokenType.REFRESH)
        except JWTError as exc:
            raise UnauthorizedError("Invalid refresh token.") from exc

        stored = await self.tokens.find_valid(refresh_token)
        if not stored:
            raise UnauthorizedError("Refresh token revoked or expired.")

        # Rotate: revoke old token, issue a fresh pair.
        await self.tokens.revoke(refresh_token)
        return await self._issue_tokens(payload["sub"], payload.get("email", ""))

    async def logout(self, refresh_token: str) -> None:
        await self.tokens.revoke(refresh_token)

    async def logout_all(self, user_id: str) -> None:
        await self.tokens.revoke_all_for_user(user_id)

    # ------------------------------------------------------------------ #
    # Password recovery (ready structure)
    # ------------------------------------------------------------------ #
    async def forgot_password(self, payload: ForgotPasswordRequest) -> Dict[str, Any]:
        user = await self.users.get_by_email(payload.email)
        # Always return success to avoid user enumeration.
        if not user:
            return {"reset_token": None}

        reset_token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES
        )
        await self.users.update(
            user["id"],
            {"password_reset_token": reset_token, "password_reset_expires": expires},
        )
        # In production the token would be emailed; returned here for dev wiring.
        return {"reset_token": reset_token}

    async def reset_password(self, payload: ResetPasswordRequest) -> None:
        validate_password_strength(payload.new_password)
        user = await self.users.get_by_reset_token(payload.token)
        if not user:
            raise UnauthorizedError("Invalid or expired reset token.")

        expires = user.get("password_reset_expires")
        if expires and _ensure_aware(expires) < datetime.now(timezone.utc):
            raise UnauthorizedError("Reset token has expired.")

        await self.users.update(
            user["id"],
            {
                "hashed_password": hash_password(payload.new_password),
                "password_reset_token": None,
                "password_reset_expires": None,
            },
        )
        await self.tokens.revoke_all_for_user(user["id"])

    async def verify_email(self, token: str) -> None:
        user = await self.users.get_by_verify_token(token)
        if not user:
            raise UnauthorizedError("Invalid verification token.")
        await self.users.update(
            user["id"], {"is_email_verified": True, "email_verify_token": None}
        )

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    async def _issue_tokens(self, user_id: str, email: str) -> TokenPair:
        access = create_access_token(user_id, {"email": email})
        refresh = create_refresh_token(user_id, {"email": email})
        await self.tokens.store(user_id, refresh, token_expiry(TokenType.REFRESH))
        return TokenPair(access_token=access, refresh_token=refresh)


def _ensure_aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
