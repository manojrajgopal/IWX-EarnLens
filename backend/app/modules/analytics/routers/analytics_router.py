"""HTTP routes for analytics: dashboard, graph, distributions, export."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_current_user, get_current_user_id
from app.core.constants import (
    IncomeStatus,
    IncomeType,
    PaymentMode,
    RecurrenceType,
)
from app.modules.analytics.constants.analytics_constants import GroupBy
from app.modules.analytics.dependencies.analytics_dependencies import (
    get_analytics_service,
)
from app.modules.analytics.schemas.analytics_schemas import (
    DashboardSummary,
    DistributionItem,
    GraphResponse,
    TotalsSummary,
)
from app.modules.analytics.services.analytics_service import AnalyticsService
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def analytics_filters(
    income_type: Optional[IncomeType] = Query(default=None),
    recurrence: Optional[RecurrenceType] = Query(default=None),
    status_: Optional[IncomeStatus] = Query(default=None, alias="status"),
    payment_mode: Optional[PaymentMode] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
    source_id: Optional[str] = Query(default=None),
    tag_id: Optional[str] = Query(default=None),
    currency: Optional[str] = Query(default=None),
    min_amount: Optional[float] = Query(default=None),
    max_amount: Optional[float] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    is_recurring: Optional[bool] = Query(default=None),
) -> IncomeFilter:
    return IncomeFilter(
        income_type=income_type,
        recurrence=recurrence,
        status=status_,
        payment_mode=payment_mode,
        category_id=category_id,
        source_id=source_id,
        tag_id=tag_id,
        currency=currency,
        min_amount=min_amount,
        max_amount=max_amount,
        start_date=start_date,
        end_date=end_date,
        is_recurring=is_recurring,
    )


@router.get("/dashboard", response_model=APIResponse[DashboardSummary])
async def dashboard(
    filters: IncomeFilter = Depends(analytics_filters),
    user=Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
) -> APIResponse[DashboardSummary]:
    currency = filters.currency or user.get("default_currency", "USD")
    data = await service.dashboard(user["id"], filters, currency)
    return APIResponse(data=data)


@router.get("/summary", response_model=APIResponse[TotalsSummary])
async def summary(
    filters: IncomeFilter = Depends(analytics_filters),
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
) -> APIResponse[TotalsSummary]:
    data = await service.dashboard(user_id, filters, filters.currency or "USD")
    return APIResponse(data=data.totals)


@router.get("/graph", response_model=APIResponse[GraphResponse])
async def graph(
    group_by: GroupBy = Query(default=GroupBy.MONTH),
    split_by: Optional[str] = Query(default=None),
    filters: IncomeFilter = Depends(analytics_filters),
    user_id: str = Depends(get_current_user_id),
    service: AnalyticsService = Depends(get_analytics_service),
) -> APIResponse[GraphResponse]:
    data = await service.graph(user_id, filters, group_by, split_by)
    return APIResponse(data=data)


@router.get("/distribution", response_model=APIResponse[List[DistributionItem]])
async def distribution(
    by: str = Query(default="category", pattern="^(category|source|type)$"),
    filters: IncomeFilter = Depends(analytics_filters),
    user=Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
) -> APIResponse[List[DistributionItem]]:
    currency = filters.currency or user.get("default_currency", "USD")
    summary = await service.dashboard(user["id"], filters, currency)
    mapping = {
        "category": summary.by_category,
        "source": summary.by_source,
        "type": summary.by_type,
    }
    return APIResponse(data=mapping[by])
