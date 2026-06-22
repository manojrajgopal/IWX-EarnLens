"""Helpers for generating and formatting one-time passcodes (OTPs)."""
from __future__ import annotations

import secrets

from app.core.config import settings


def generate_otp(length: int | None = None) -> str:
    """Return a cryptographically-random numeric OTP of ``length`` digits.

    Leading zeros are preserved (the value is a zero-padded string), and
    :func:`secrets.randbelow` is used so the code is unpredictable.
    """
    digits = length or settings.OTP_LENGTH
    upper_bound = 10**digits
    return str(secrets.randbelow(upper_bound)).zfill(digits)
