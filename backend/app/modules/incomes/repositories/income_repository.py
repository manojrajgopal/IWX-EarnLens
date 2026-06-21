"""Data-access layer for income entries."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.base_repository import BaseRepository, to_object_id


class IncomeRepository(BaseRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db, Collections.INCOMES)

    async def list_for_user(
        self,
        query: Dict[str, Any],
        *,
        skip: int,
        limit: int,
        sort_field: str = "payment_date",
        sort_dir: int = -1,
    ) -> List[Dict[str, Any]]:
        return await self.list(
            query, skip=skip, limit=limit, sort=[(sort_field, sort_dir)]
        )

    async def get_owned(self, income_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        return await self.get_one({"_id": to_object_id(income_id), "user_id": user_id})

    async def delete_owned(self, income_id: str, user_id: str) -> bool:
        result = await self.collection.delete_one(
            {"_id": to_object_id(income_id), "user_id": user_id}
        )
        return result.deleted_count > 0
