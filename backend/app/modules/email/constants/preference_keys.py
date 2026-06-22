"""Email preference catalog: the toggles users see in settings.

The catalog is the single source of truth shared (conceptually) with the
frontend. ``DEFAULT_EMAIL_CHANNELS`` seeds new preference documents so that,
by default, every email is enabled ("always send") until a user opts out.
"""
from __future__ import annotations

from typing import Dict, List

# Default state for every per-event channel toggle. All on by default.
DEFAULT_EMAIL_CHANNELS: Dict[str, bool] = {
    "welcome": True,
    "login_alert": True,
    "password_reset": True,
    "password_changed": True,
    "income_created": True,
    "income_updated": True,
    "income_deleted": True,
}


# Rich, ordered metadata for rendering the settings floating window.
# ``locked`` channels are always-on (security critical) and shown disabled.
EMAIL_CHANNEL_CATALOG: List[Dict[str, object]] = [
    {
        "key": "welcome",
        "label": "Welcome email",
        "description": "Sent once when you create your account.",
        "group": "Account",
        "locked": True,
    },
    {
        "key": "login_alert",
        "label": "New sign-in alerts",
        "description": "Notifies you whenever your account is signed into.",
        "group": "Account",
        "locked": True,
    },
    {
        "key": "password_reset",
        "label": "Password reset",
        "description": "Delivers your password reset link.",
        "group": "Security",
        "locked": True,
    },
    {
        "key": "password_changed",
        "label": "Password changed",
        "description": "Confirms whenever your password is changed.",
        "group": "Security",
        "locked": True,
    },
    {
        "key": "income_created",
        "label": "Income added",
        "description": "Email me a receipt when I record new income.",
        "group": "Income",
        "locked": False,
    },
    {
        "key": "income_updated",
        "label": "Income updated",
        "description": "Email me when an income entry is edited.",
        "group": "Income",
        "locked": False,
    },
    {
        "key": "income_deleted",
        "label": "Income deleted",
        "description": "Email me when an income entry is removed.",
        "group": "Income",
        "locked": False,
    },
]


# Keys whose emails are mandatory: always sent and not user-configurable.
# Derived from the catalog so the rule stays in one place.
ALWAYS_ON_CHANNELS: frozenset = frozenset(
    str(channel["key"]) for channel in EMAIL_CHANNEL_CATALOG if channel["locked"]
)
