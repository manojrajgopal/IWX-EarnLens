"""Decides whether a given email event is allowed for a user.

Rules, in order:
  1. Critical events (e.g. password reset) always pass.
  2. The master ``notifications.email`` switch must be on.
  3. The per-event channel toggle under ``notifications.channels`` must be on
     (missing keys default to enabled, i.e. "always send" until opted out).
"""
from __future__ import annotations

from typing import Any, Dict

from app.modules.email.constants.email_events import (
    CRITICAL_EVENTS,
    EVENT_PREFERENCE_KEYS,
    EmailEvent,
)
from app.modules.preferences.services.preferences_service import PreferencesRepository


class NotificationGate:
    """Reads a user's preferences and authorises (or blocks) an event."""

    def __init__(self, preferences_repo: PreferencesRepository) -> None:
        self._prefs = preferences_repo

    async def is_enabled(self, user_id: str, event: EmailEvent) -> bool:
        if event in CRITICAL_EVENTS:
            return True

        prefs = await self._prefs.get_or_create(user_id)
        return self._evaluate(prefs, event)

    @staticmethod
    def _evaluate(prefs: Dict[str, Any], event: EmailEvent) -> bool:
        notifications: Dict[str, Any] = prefs.get("notifications") or {}

        # Master switch (default True so new users get emails).
        if not notifications.get("email", True):
            return False

        channels: Dict[str, Any] = notifications.get("channels") or {}
        key = EVENT_PREFERENCE_KEYS[event]
        return bool(channels.get(key, True))
