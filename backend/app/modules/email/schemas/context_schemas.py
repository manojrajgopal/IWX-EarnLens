"""Context objects consumed by templates when rendering an email."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass(slots=True)
class AuthEmailContext:
    """Everything an auth-related template might need."""

    email: str
    full_name: str
    reset_link: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    otp_code: Optional[str] = None
    otp_expiry_minutes: Optional[int] = None

    @property
    def first_name(self) -> str:
        return self.full_name.split()[0] if self.full_name.strip() else "there"


@dataclass(slots=True)
class IncomeEmailContext:
    """Snapshot of an income entry for income-event templates."""

    email: str
    full_name: str
    title: str
    amount: float
    currency: str
    income_type: str = ""
    payment_date: str = ""
    status: str = ""
    metadata: dict = field(default_factory=dict)

    @property
    def first_name(self) -> str:
        return self.full_name.split()[0] if self.full_name.strip() else "there"
