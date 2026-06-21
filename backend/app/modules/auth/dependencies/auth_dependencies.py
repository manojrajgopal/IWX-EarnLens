"""Dependency providers specific to the auth module."""
from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_db, get_user_repository
from app.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)
from app.modules.auth.services.auth_service import AuthService
from app.modules.users.repositories.user_repository import UserRepository


def get_token_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> RefreshTokenRepository:
    return RefreshTokenRepository(db)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    token_repo: RefreshTokenRepository = Depends(get_token_repository),
) -> AuthService:
    return AuthService(user_repo, token_repo)
