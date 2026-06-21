"""Security primitives: password hashing and JWT token management.

This module is deliberately framework-agnostic so it can be reused by
auth services, dependencies, and future modules (email verification,
password reset) without coupling to FastAPI.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.constants import TokenType

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --------------------------------------------------------------------------- #
# Password hashing
# --------------------------------------------------------------------------- #
def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its hash."""
    return _pwd_context.verify(plain_password, hashed_password)


# --------------------------------------------------------------------------- #
# JWT helpers
# --------------------------------------------------------------------------- #
def _create_token(
    subject: str,
    secret: str,
    expires_delta: timedelta,
    token_type: TokenType,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": subject,
        "type": token_type.value,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, secret, algorithm=settings.JWT_ALGORITHM)


def create_access_token(
    subject: str, extra_claims: Optional[Dict[str, Any]] = None
) -> str:
    return _create_token(
        subject,
        settings.JWT_SECRET_KEY,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        TokenType.ACCESS,
        extra_claims,
    )


def create_refresh_token(
    subject: str, extra_claims: Optional[Dict[str, Any]] = None
) -> str:
    return _create_token(
        subject,
        settings.JWT_REFRESH_SECRET_KEY,
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        TokenType.REFRESH,
        extra_claims,
    )


def decode_token(token: str, token_type: TokenType) -> Dict[str, Any]:
    """Decode and validate a JWT. Raises ``JWTError`` on failure."""
    secret = (
        settings.JWT_SECRET_KEY
        if token_type == TokenType.ACCESS
        else settings.JWT_REFRESH_SECRET_KEY
    )
    payload = jwt.decode(token, secret, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != token_type.value:
        raise JWTError("Invalid token type")
    return payload


def token_expiry(token_type: TokenType) -> datetime:
    """Return the UTC expiry datetime for a freshly issued token."""
    now = datetime.now(timezone.utc)
    if token_type == TokenType.ACCESS:
        return now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
