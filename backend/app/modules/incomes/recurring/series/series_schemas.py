"""Schemas describing a recurring income series roll-up."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from app.shared.schemas import BaseSchema


class SeriesSummary(BaseSchema):
    """Aggregated snapshot of an entire recurring series.

    A *series* is the template income (the first occurrence) together with
    every auto-generated child that descends from it. The detail view uses
    this to show how much the series has produced and where it is heading.
    """

    parent_id: str
    is_series: bool = True
    occurrence_count: int = 0
    generated_count: int = 0
    total_amount: float = 0.0
    currency: str = "USD"
    first_date: Optional[datetime] = None
    last_date: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
