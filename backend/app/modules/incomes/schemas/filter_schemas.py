"""Shared filter schema used by income listing and analytics endpoints."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from app.core.constants import IncomeStatus, IncomeType, PaymentMode, RecurrenceType
from app.shared.schemas import BaseSchema


class IncomeFilter(BaseSchema):
    """Normalized filter accepted by list / analytics / graph endpoints."""

    search: Optional[str] = None
    income_type: Optional[IncomeType] = None
    recurrence: Optional[RecurrenceType] = None
    status: Optional[IncomeStatus] = None
    payment_mode: Optional[PaymentMode] = None
    category_id: Optional[str] = None
    source_id: Optional[str] = None
    tag_id: Optional[str] = None
    currency: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    tag_ids: Optional[List[str]] = None
    top_level: Optional[bool] = None
    """When true, hide auto-generated occurrences and only surface the
    series templates and one-off entries (the "grandparent" rows)."""
