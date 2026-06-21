"""Report schemas."""
from __future__ import annotations

from datetime import datetime
from typing import List

from app.modules.analytics.schemas.analytics_schemas import (
    DistributionItem,
    GraphPoint,
    TotalsSummary,
)
from app.shared.schemas import BaseSchema


class ReportRow(BaseSchema):
    title: str
    amount: float
    currency: str
    income_type: str
    recurrence: str
    payment_date: datetime
    source_name: str = ""
    category: str = ""
    status: str = ""


class IncomeReport(BaseSchema):
    generated_at: datetime
    currency: str
    totals: TotalsSummary
    by_category: List[DistributionItem]
    by_type: List[DistributionItem]
    trend: List[GraphPoint]
    rows: List[ReportRow]
