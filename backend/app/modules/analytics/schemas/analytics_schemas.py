"""Analytics response schemas (normalized contracts for the frontend)."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from app.modules.analytics.constants.analytics_constants import GroupBy
from app.shared.schemas import BaseSchema


class TotalsSummary(BaseSchema):
    total: float = 0.0
    count: int = 0
    average: float = 0.0
    minimum: float = 0.0
    maximum: float = 0.0


class RecurringSplit(BaseSchema):
    recurring_total: float = 0.0
    recurring_count: int = 0
    one_time_total: float = 0.0
    one_time_count: int = 0


class PeriodSummary(BaseSchema):
    this_week: float = 0.0
    this_month: float = 0.0
    this_quarter: float = 0.0
    this_year: float = 0.0


class DistributionItem(BaseSchema):
    key: str
    label: str
    total: float
    count: int
    percentage: float = 0.0
    color: Optional[str] = None


class TopSource(BaseSchema):
    source_id: Optional[str] = None
    label: str
    total: float
    count: int


class GrowthMetric(BaseSchema):
    current: float = 0.0
    previous: float = 0.0
    change: float = 0.0
    change_percent: float = 0.0


class GraphPoint(BaseSchema):
    period: str
    label: str
    total: float
    count: int


class GraphSeries(BaseSchema):
    key: str
    label: str
    color: Optional[str] = None
    points: List[GraphPoint]


class GraphResponse(BaseSchema):
    group_by: GroupBy
    labels: List[str]
    series: List[GraphSeries]
    totals_by_period: List[GraphPoint]


class DashboardSummary(BaseSchema):
    totals: TotalsSummary
    recurring: RecurringSplit
    periods: PeriodSummary
    growth: GrowthMetric
    by_category: List[DistributionItem]
    by_source: List[DistributionItem]
    by_type: List[DistributionItem]
    top_sources: List[TopSource]
    trend: List[GraphPoint]
    currency: str
    generated_at: datetime
