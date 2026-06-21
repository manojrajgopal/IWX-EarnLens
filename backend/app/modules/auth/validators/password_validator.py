"""Reusable validation helpers for authentication input."""
from __future__ import annotations

import re

from app.core.exceptions import ValidationError

_PASSWORD_RULES = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{6,}$")


def validate_password_strength(password: str) -> None:
    """Ensure a password meets minimum strength requirements.

    Rule: at least 6 characters, containing letters and digits.
    Kept intentionally small so policy can evolve in one place.
    """
    if not _PASSWORD_RULES.match(password):
        raise ValidationError(
            "Password must be at least 6 characters and include letters and numbers."
        )
