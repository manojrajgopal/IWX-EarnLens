"""RFC 5322 address formatting helpers."""
from __future__ import annotations

from email.headerregistry import Address
from email.utils import formataddr
from typing import Optional


def format_address(email: str, name: Optional[str] = None) -> str:
    """Return a safe ``Name <email>`` header value (or bare address)."""
    if not name:
        return email
    return formataddr((name, email))


def build_address(email: str, name: Optional[str] = None) -> Address:
    """Build an :class:`email.headerregistry.Address` for EmailMessage APIs."""
    local, _, domain = email.partition("@")
    return Address(display_name=name or "", username=local, domain=domain)
