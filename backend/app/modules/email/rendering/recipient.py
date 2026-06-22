"""Extracts the recipient email/name from any context object."""
from __future__ import annotations

from typing import Optional, Tuple

from app.modules.email.templates.registry import AnyContext


def resolve_recipient(context: AnyContext) -> Tuple[str, Optional[str]]:
    """Return ``(email, full_name)`` for the given context."""
    email = getattr(context, "email", "")
    name = getattr(context, "full_name", None)
    return email, name
