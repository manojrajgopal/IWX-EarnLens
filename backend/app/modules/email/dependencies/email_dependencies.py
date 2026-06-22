"""Wires the email service, gate, and notifier into the DI graph."""
from __future__ import annotations

from functools import lru_cache

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_db
from app.modules.email.preferences.notification_gate import NotificationGate
from app.modules.email.services.email_notifier import EmailNotifier
from app.modules.email.services.email_service import EmailService
from app.modules.preferences.services.preferences_service import PreferencesRepository


@lru_cache
def get_email_service() -> EmailService:
    """Process-wide singleton (provider + renderer are stateless/cached)."""
    return EmailService()


def get_notification_gate(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> NotificationGate:
    return NotificationGate(PreferencesRepository(db))


def get_email_notifier(
    email_service: EmailService = Depends(get_email_service),
    gate: NotificationGate = Depends(get_notification_gate),
) -> EmailNotifier:
    return EmailNotifier(email_service, gate)
