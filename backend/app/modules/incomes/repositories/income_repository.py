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

    @staticmethod
    def series_query(parent_id: str, user_id: str) -> Dict[str, Any]:
        """Match every entry that belongs to a recurring series.

        A series is made of the template document (the first occurrence,
        whose ``_id`` equals ``parent_id``) plus every auto-generated child
        that points back to it through ``recurring_parent_id``.
        """
        return {
            "user_id": user_id,
            "$or": [
                {"_id": to_object_id(parent_id)},
                {"recurring_parent_id": parent_id},
            ],
        }

    async def list_series(
        self,
        parent_id: str,
        user_id: str,
        *,
        skip: int,
        limit: int,
        sort_dir: int = -1,
    ) -> List[Dict[str, Any]]:
        """Paginated occurrences of a recurring series (newest first)."""
        return await self.list(
            self.series_query(parent_id, user_id),
            skip=skip,
            limit=limit,
            sort=[("payment_date", sort_dir)],
        )

    async def count_series(self, parent_id: str, user_id: str) -> int:
        """Total number of occurrences recorded for a series."""
        return await self.count(self.series_query(parent_id, user_id))

    async def series_stats(self, parent_id: str, user_id: str) -> Dict[str, Any]:
        """Aggregate roll-up for a series: totals and date span."""
        pipeline = [
            {"$match": self.series_query(parent_id, user_id)},
            {
                "$group": {
                    "_id": None,
                    "total_amount": {"$sum": "$amount"},
                    "occurrence_count": {"$sum": 1},
                    "generated_count": {
                        "$sum": {"$cond": ["$is_auto_generated", 1, 0]}
                    },
                    "first_date": {"$min": "$payment_date"},
                    "last_date": {"$max": "$payment_date"},
                }
            },
        ]
        rows = await self.aggregate(pipeline)
        return rows[0] if rows else {}
