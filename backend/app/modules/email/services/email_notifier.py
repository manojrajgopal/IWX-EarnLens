"""Preference-aware orchestrator other domains depend on.

This is the single entry point auth/income use: it checks the user's
notification preferences and only then asks the EmailService to send.
"""
from __future__ import annotations

from app.core.logging_config import get_logger
from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.preferences.notification_gate import NotificationGate
from app.modules.email.services.email_service import EmailService
from app.modules.email.templates.registry import AnyContext

logger = get_logger(__name__)


class EmailNotifier:
    """Gate + send. Never raises; email problems must not break a request."""

    def __init__(self, email_service: EmailService, gate: NotificationGate) -> None:
        self._email = email_service
        self._gate = gate

    async def notify(
        self, user_id: str, event: EmailEvent, context: AnyContext
    ) -> None:
        try:
            if not await self._gate.is_enabled(user_id, event):
                logger.debug("Email '%s' skipped for user %s (opted out).", event, user_id)
                return
            self._email.send(event, context)
        except Exception as exc:  # noqa: BLE001 - best-effort notification
            logger.warning("notify(%s) failed for user %s: %s", event, user_id, exc)
