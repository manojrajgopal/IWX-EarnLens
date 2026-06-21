"""Aggregation-focused data access for analytics.

All methods accept a pre-built MongoDB query (from the shared income
query builder) so filtering stays consistent with the income listing.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections, RecurrenceType
from app.modules.analytics.constants.analytics_constants import GroupBy, DATE_TRUNC_UNIT


class AnalyticsRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db[Collections.INCOMES]

    async def _aggregate(self, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return await self.collection.aggregate(pipeline).to_list(length=None)

    async def totals(self, query: Dict[str, Any]) -> Dict[str, Any]:
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                    "average": {"$avg": "$amount"},
                    "minimum": {"$min": "$amount"},
                    "maximum": {"$max": "$amount"},
                }
            },
        ]
        rows = await self._aggregate(pipeline)
        return rows[0] if rows else {}

    async def recurring_split(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$recurrence", RecurrenceType.ONE_TIME.value]},
                            "one_time",
                            "recurring",
                        ]
                    },
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                }
            },
        ]
        return await self._aggregate(pipeline)

    async def distribution(
        self, query: Dict[str, Any], field: str
    ) -> List[Dict[str, Any]]:
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": f"${field}",
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"total": -1}},
        ]
        return await self._aggregate(pipeline)

    async def top_sources(
        self, query: Dict[str, Any], limit: int = 5
    ) -> List[Dict[str, Any]]:
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": {"source_id": "$source_id", "source_name": "$source_name"},
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"total": -1}},
            {"$limit": limit},
        ]
        return await self._aggregate(pipeline)

    async def time_series(
        self,
        query: Dict[str, Any],
        group_by: GroupBy,
        split_field: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Bucket income totals by period, optionally split by a field."""
        unit = DATE_TRUNC_UNIT[group_by]
        group_id: Dict[str, Any] = {
            "period": {"$dateTrunc": {"date": "$payment_date", "unit": unit}}
        }
        if split_field:
            group_id["split"] = f"${split_field}"

        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": group_id,
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id.period": 1}},
        ]
        return await self._aggregate(pipeline)

    async def period_total(self, query: Dict[str, Any]) -> float:
        pipeline = [
            {"$match": query},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        rows = await self._aggregate(pipeline)
        return float(rows[0]["total"]) if rows else 0.0
