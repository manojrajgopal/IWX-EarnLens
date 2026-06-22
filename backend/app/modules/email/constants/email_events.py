"""Canonical set of email events the application can emit."""
from __future__ import annotations

from enum import Enum
from typing import Dict, FrozenSet


class EmailEvent(str, Enum):
    """Every transactional email maps to exactly one event."""

    REGISTRATION_OTP = "registration_otp"
    WELCOME = "welcome"
    LOGIN_ALERT = "login_alert"
    PASSWORD_RESET = "password_reset"
    PASSWORD_CHANGED = "password_changed"
    INCOME_CREATED = "income_created"
    INCOME_UPDATED = "income_updated"
    INCOME_DELETED = "income_deleted"


# Events that must always be delivered regardless of user preferences,
# because the email itself is the delivery mechanism / a security signal.
CRITICAL_EVENTS: FrozenSet[EmailEvent] = frozenset(
    {EmailEvent.REGISTRATION_OTP, EmailEvent.PASSWORD_RESET}
)


# Maps an event to the preference toggle key stored under
# ``preferences.notifications.channels``.
EVENT_PREFERENCE_KEYS: Dict[EmailEvent, str] = {
    EmailEvent.REGISTRATION_OTP: "registration_otp",
    EmailEvent.WELCOME: "welcome",
    EmailEvent.LOGIN_ALERT: "login_alert",
    EmailEvent.PASSWORD_RESET: "password_reset",
    EmailEvent.PASSWORD_CHANGED: "password_changed",
    EmailEvent.INCOME_CREATED: "income_created",
    EmailEvent.INCOME_UPDATED: "income_updated",
    EmailEvent.INCOME_DELETED: "income_deleted",
}
