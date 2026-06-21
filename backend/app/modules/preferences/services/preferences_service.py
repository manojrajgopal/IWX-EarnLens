"""Preferences repository and service (upsert-based singleton per user)."""
from __future__ import annotations

from typing import Any, Dict

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.shared.base_repository import serialize

_DEFAULTS: Dict[str, Any] = {
    "theme": "system",
    "default_currency": "USD",
    "default_group_by": "month",
    "default_chart_style": "area",
    "week_starts_on": "monday",
    "number_format": "en-US",
    "dashboard_widgets": {
        "summary_cards": True,
        "graph": True,
        "distribution": True,
        "top_sources": True,
        "recent": True,
    },
    "notifications": {"email": False, "weekly_summary": False},
    "metadata": {},
}


class PreferencesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db[Collections.PREFERENCES]

    async def get_or_create(self, user_id: str) -> Dict[str, Any]:
        existing = await self.collection.find_one({"user_id": user_id})
        if existing:
            return serialize(existing)
        document = {"user_id": user_id, **_DEFAULTS}
        await self.collection.insert_one(dict(document))
        return document

    async def update(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        await self.collection.update_one(
            {"user_id": user_id}, {"$set": updates}, upsert=True
        )
        return await self.get_or_create(user_id)


class PreferencesService:
    def __init__(self, repository: PreferencesRepository) -> None:
        self.repository = repository

    async def get(self, user_id: str) -> Dict[str, Any]:
        return await self.repository.get_or_create(user_id)

    async def update(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        await self.repository.get_or_create(user_id)
        return await self.repository.update(user_id, updates)
