"""Schemas for recurring-income operations (scoped updates)."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import Field

from app.core.constants import IncomeStatus, PaymentMode
from app.modules.incomes.recurring.constants.update_scope import UpdateScope
from app.shared.schemas import BaseSchema


class ScopedUpdateChanges(BaseSchema):
    """The mutable fields a scoped update is allowed to touch.

    Intentionally narrower than a full income update — identity-defining fields
    (type, recurrence, currency, title) cannot be altered through the scoped
    edit flow.
    """

    amount: Optional[float] = Field(default=None, gt=0)
    status: Optional[IncomeStatus] = None
    payment_date: Optional[datetime] = None
    payment_time: Optional[str] = None
    day_of_month: Optional[int] = Field(default=None, ge=1, le=28)
    payment_mode: Optional[PaymentMode] = None
    notes: Optional[str] = None
    is_taxable: Optional[bool] = None


class ScopedUpdateRequest(BaseSchema):
    """Request body for ``PATCH /incomes/{id}/scoped``."""

    scope: UpdateScope
    changes: ScopedUpdateChanges


class ScopedUpdateResult(BaseSchema):
    """Outcome of a scoped update."""

    affected: int
