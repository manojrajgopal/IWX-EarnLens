"""Preferences repository and service (upsert-based singleton per user)."""
from __future__ import annotations

from typing import Any, Dict

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import Collections
from app.modules.email.constants.preference_keys import DEFAULT_EMAIL_CHANNELS
from app.shared.base_repository import serialize

_DEFAULTS: Dict[str, Any] = {
    "theme": "system",
    "default_currency": "INR",
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
    "notifications": {
        "email": True,
        "weekly_summary": False,
        "channels": dict(DEFAULT_EMAIL_CHANNELS),
    },
    "metadata": {},
}


def _with_notification_defaults(document: Dict[str, Any]) -> Dict[str, Any]:
    """Backfill missing notification keys so older docs gain new channels."""
    notifications = dict(document.get("notifications") or {})
    notifications.setdefault("email", True)
    notifications.setdefault("weekly_summary", False)
    channels = dict(notifications.get("channels") or {})
    for key, value in DEFAULT_EMAIL_CHANNELS.items():
        channels.setdefault(key, value)
    notifications["channels"] = channels
    document["notifications"] = notifications
    return document


class PreferencesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db[Collections.PREFERENCES]

    async def get_or_create(self, user_id: str) -> Dict[str, Any]:
        existing = await self.collection.find_one({"user_id": user_id})
        if existing:
            return _with_notification_defaults(serialize(existing))
        document = {"user_id": user_id, **_DEFAULTS}
        await self.collection.insert_one(dict(document))
        return _with_notification_defaults(document)

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
