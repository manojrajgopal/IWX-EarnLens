"""Income API schemas (DTOs) and the filter query schema."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import Field, field_validator

from app.core.constants import (
    IncomeStatus,
    IncomeType,
    PaymentMode,
    RecurrenceType,
)
from app.shared.schemas import BaseSchema


class CustomField(BaseSchema):
    key: str
    value: Any
    label: Optional[str] = None


class AttachmentMeta(BaseSchema):
    file_name: str
    url: Optional[str] = None
    content_type: Optional[str] = None
    size: Optional[int] = None


class IncomeBase(BaseSchema):
    title: str = Field(min_length=1, max_length=180)
    amount: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    income_type: IncomeType = IncomeType.SALARY
    recurrence: RecurrenceType = RecurrenceType.ONE_TIME
    status: IncomeStatus = IncomeStatus.RECEIVED

    payment_date: datetime
    payment_time: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    # Recurring-income automation.
    day_of_month: Optional[int] = Field(default=None, ge=1, le=28)
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

    attachments: List[AttachmentMeta] = Field(default_factory=list)
    custom_fields: List[CustomField] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("currency")
    @classmethod
    def _upper_currency(cls, value: str) -> str:
        return value.upper()


class IncomeCreate(IncomeBase):
    """Payload to create a new income entry."""


class IncomeUpdate(BaseSchema):
    """Partial update payload — every field optional."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=180)
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    income_type: Optional[IncomeType] = None
    recurrence: Optional[RecurrenceType] = None
    status: Optional[IncomeStatus] = None
    payment_date: Optional[datetime] = None
    payment_time: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    day_of_month: Optional[int] = Field(default=None, ge=1, le=28)
    auto_add: Optional[bool] = None
    category_id: Optional[str] = None
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    tag_ids: Optional[List[str]] = None
    payment_mode: Optional[PaymentMode] = None
    platform: Optional[str] = None
    client: Optional[str] = None
    employer: Optional[str] = None
    project_name: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    tax_notes: Optional[str] = None
    is_taxable: Optional[bool] = None
    attachments: Optional[List[AttachmentMeta]] = None
    custom_fields: Optional[List[CustomField]] = None
    metadata: Optional[Dict[str, Any]] = None


class IncomePublic(IncomeBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
