"""Data-access layer for users."""
from __future__ import annotations

from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.base_repository import BaseRepository


class UserRepository(BaseRepository):
    """Encapsulates all user persistence concerns."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.USERS)

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.get_one({"email": email.lower()})

    async def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        return await self.get_one({"username": username.lower()})

    async def get_by_identifier(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Look up user by email or username."""
        identifier_lower = identifier.lower()
        # Try email first, then username
        user = await self.get_one({"email": identifier_lower})
        if not user:
            user = await self.get_one({"username": identifier_lower})
        return user

    async def get_by_reset_token(self, token: str) -> Optional[Dict[str, Any]]:
        return await self.get_one({"password_reset_token": token})

    async def get_by_verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        return await self.get_one({"email_verify_token": token})
