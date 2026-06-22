"""Email constants: events, subjects, and preference keys."""
from app.modules.email.constants.email_events import (
    CRITICAL_EVENTS,
    EVENT_PREFERENCE_KEYS,
    EmailEvent,
)
from app.modules.email.constants.email_subjects import EMAIL_SUBJECTS
from app.modules.email.constants.preference_keys import (
    DEFAULT_EMAIL_CHANNELS,
    EMAIL_CHANNEL_CATALOG,
)

__all__ = [
    "EmailEvent",
    "CRITICAL_EVENTS",
    "EVENT_PREFERENCE_KEYS",
    "EMAIL_SUBJECTS",
    "DEFAULT_EMAIL_CHANNELS",
    "EMAIL_CHANNEL_CATALOG",
]
