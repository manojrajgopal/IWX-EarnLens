"""Shared FastAPI dependencies used by route handlers across modules.

This module is the composition root for dependency injection: it builds
repositories and services from the request-scoped database handle and
exposes the authenticated-user dependency.
"""
from __future__ import annotations

from typing import Any, Dict

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import TokenType
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.mongodb import get_database
from app.modules.users.repositories.user_repository import UserRepository
from app.modules.users.services.user_service import UserService

_bearer = HTTPBearer(auto_error=False)


# --------------------------------------------------------------------------- #
# Database + repositories + services
# --------------------------------------------------------------------------- #
def get_db() -> AsyncIOMotorDatabase:
    return get_database()


def get_user_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> UserRepository:
    return UserRepository(db)


def get_user_service(
    repo: UserRepository = Depends(get_user_repository),
) -> UserService:
    return UserService(repo)


# --------------------------------------------------------------------------- #
# Authentication
# --------------------------------------------------------------------------- #
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    repo: UserRepository = Depends(get_user_repository),
) -> Dict[str, Any]:
    """Resolve and validate the current user from the bearer access token."""
    if credentials is None or not credentials.credentials:
        raise UnauthorizedError("Missing authentication token.")
    try:
        payload = decode_token(credentials.credentials, TokenType.ACCESS)
    except JWTError as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token payload.")

    user = await repo.get_by_id(user_id)
    if not user or not user.get("is_active", False):
        raise UnauthorizedError("User no longer active.")
    return user


def get_current_user_id(
    user: Dict[str, Any] = Depends(get_current_user),
) -> str:
    return user["id"]


async def require_admin(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    if user.get("role") != "admin":
        raise ForbiddenError("Administrator access required.")
    return user
