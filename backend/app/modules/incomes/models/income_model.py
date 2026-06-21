"""Internal domain model describing an income document."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.core.constants import (
    IncomeStatus,
    IncomeType,
    PaymentMode,
    RecurrenceType,
)


class IncomeModel(BaseModel):
    """Shape of an income document stored in MongoDB.

    Designed for flexibility: a free-form ``metadata`` map and
    ``custom_fields`` list let users extend the schema without migrations.
    """

    user_id: str
    title: str
    amount: float
    currency: str = "USD"
    income_type: IncomeType = IncomeType.SALARY
    recurrence: RecurrenceType = RecurrenceType.ONE_TIME
    status: IncomeStatus = IncomeStatus.RECEIVED

    payment_date: datetime
    payment_time: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    # Recurring-income automation.
    day_of_month: Optional[int] = None
    auto_add: bool = False
    is_auto_generated: bool = False
    recurring_parent_id: Optional[str] = None
    next_run_at: Optional[datetime] = None

    category_id: Optional[str] = None
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    tag_ids: List[str] = Field(default_factory=list)

    payment_mode: Optional[PaymentMode] = None
    platform: Optional[str] = None
    client: Optional[str] = None
    employer: Optional[str] = None
    project_name: Optional[str] = None
    reference_number: Optional[str] = None

    notes: Optional[str] = None
    tax_notes: Optional[str] = None
    is_taxable: bool = True

    attachments: List[Dict[str, Any]] = Field(default_factory=list)
    custom_fields: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
