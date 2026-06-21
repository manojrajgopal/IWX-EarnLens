"""Persistence for refresh tokens (rotation + revocation support)."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.base_repository import BaseRepository


class RefreshTokenRepository(BaseRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.REFRESH_TOKENS)

    async def store(
        self, user_id: str, token: str, expires_at: datetime
    ) -> Dict[str, Any]:
        return await self.create(
            {"user_id": user_id, "token": token, "expires_at": expires_at, "revoked": False}
        )

    async def find_valid(self, token: str) -> Optional[Dict[str, Any]]:
        return await self.get_one({"token": token, "revoked": False})

    async def revoke(self, token: str) -> None:
        await self.collection.update_one(
            {"token": token}, {"$set": {"revoked": True}}
        )

    async def revoke_all_for_user(self, user_id: str) -> None:
        await self.collection.update_many(
            {"user_id": user_id}, {"$set": {"revoked": True}}
        )
