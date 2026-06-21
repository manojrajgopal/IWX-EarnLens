"""HTTP routes for income CRUD and listing/filtering."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import get_current_user_id
from app.core.constants import (
    IncomeStatus,
    IncomeType,
    PaymentMode,
    RecurrenceType,
)
from app.modules.incomes.controllers.income_controller import IncomeController
from app.modules.incomes.dependencies.income_dependencies import (
    get_income_series_service,
    get_income_service,
    get_recurring_income_service,
)
from app.modules.incomes.recurring.schemas.recurring_schemas import (
    ScopedUpdateRequest,
    ScopedUpdateResult,
)
from app.modules.incomes.recurring.series.series_schemas import SeriesSummary
from app.modules.incomes.recurring.series.series_service import IncomeSeriesService
from app.modules.incomes.recurring.services.recurring_service import (
    RecurringIncomeService,
)
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.schemas.income_schemas import (
    IncomeCreate,
    IncomePublic,
    IncomeUpdate,
)
from app.modules.incomes.services.income_service import IncomeService
from app.shared.pagination import PageParams
from app.shared.schemas import APIResponse, PaginatedResponse

router = APIRouter(prefix="/incomes", tags=["Incomes"])


def _controller(service: IncomeService = Depends(get_income_service)) -> IncomeController:
    return IncomeController(service)


def _filters(
    search: Optional[str] = Query(default=None),
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
    top_level: Optional[bool] = Query(default=None),
) -> IncomeFilter:
    return IncomeFilter(
        search=search,
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
        top_level=top_level,
    )


@router.post(
    "",
    response_model=APIResponse[IncomePublic],
    status_code=status.HTTP_201_CREATED,
)
async def create_income(
    payload: IncomeCreate,
    user_id: str = Depends(get_current_user_id),
    controller: IncomeController = Depends(_controller),
) -> APIResponse[IncomePublic]:
    data = await controller.create(user_id, payload)
    return APIResponse(data=data, message="Income entry created.")


@router.get("", response_model=PaginatedResponse[IncomePublic])
async def list_incomes(
    filters: IncomeFilter = Depends(_filters),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    user_id: str = Depends(get_current_user_id),
    controller: IncomeController = Depends(_controller),
) -> PaginatedResponse[IncomePublic]:
    params = PageParams(page=page, page_size=page_size)
    items, total = await controller.list(user_id, filters, params)
    return PaginatedResponse(data=items, meta=params.meta(total))


@router.get("/recent", response_model=APIResponse[List[IncomePublic]])
async def recent_incomes(
    limit: int = Query(default=5, ge=1, le=50),
    user_id: str = Depends(get_current_user_id),
    service: IncomeService = Depends(get_income_service),
) -> APIResponse[List[IncomePublic]]:
    items = await service.recent(user_id, limit)
    return APIResponse(data=[IncomePublic.model_validate(i) for i in items])


@router.get(
    "/{income_id}/occurrences",
    response_model=PaginatedResponse[IncomePublic],
)
async def list_income_occurrences(
    income_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=200),
    user_id: str = Depends(get_current_user_id),
    service: IncomeSeriesService = Depends(get_income_series_service),
) -> PaginatedResponse[IncomePublic]:
    params = PageParams(page=page, page_size=page_size)
    items, total = await service.list_occurrences(user_id, income_id, params)
    return PaginatedResponse(
        data=[IncomePublic.model_validate(i) for i in items],
        meta=params.meta(total),
    )


@router.get("/{income_id}/series", response_model=APIResponse[SeriesSummary])
async def get_income_series_summary(
    income_id: str,
    user_id: str = Depends(get_current_user_id),
    service: IncomeSeriesService = Depends(get_income_series_service),
) -> APIResponse[SeriesSummary]:
    summary = await service.summary(user_id, income_id)
    return APIResponse(data=summary)


@router.get("/{income_id}", response_model=APIResponse[IncomePublic])
async def get_income(
    income_id: str,
    user_id: str = Depends(get_current_user_id),
    controller: IncomeController = Depends(_controller),
) -> APIResponse[IncomePublic]:
    data = await controller.get(user_id, income_id)
    return APIResponse(data=data)


@router.patch("/{income_id}", response_model=APIResponse[IncomePublic])
async def update_income(
    income_id: str,
    payload: IncomeUpdate,
    user_id: str = Depends(get_current_user_id),
    controller: IncomeController = Depends(_controller),
) -> APIResponse[IncomePublic]:
    data = await controller.update(user_id, income_id, payload)
    return APIResponse(data=data, message="Income entry updated.")


@router.patch("/{income_id}/scoped", response_model=APIResponse[ScopedUpdateResult])
async def update_income_scoped(
    income_id: str,
    payload: ScopedUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    service: RecurringIncomeService = Depends(get_recurring_income_service),
) -> APIResponse[ScopedUpdateResult]:
    affected = await service.scoped_update(
        user_id, income_id, payload.scope, payload.changes
    )
    return APIResponse(
        data=ScopedUpdateResult(affected=affected),
        message=f"Updated {affected} occurrence(s).",
    )


@router.delete("/{income_id}", response_model=APIResponse[dict])
async def delete_income(
    income_id: str,
    user_id: str = Depends(get_current_user_id),
    controller: IncomeController = Depends(_controller),
) -> APIResponse[dict]:
    await controller.delete(user_id, income_id)
    return APIResponse(data={"deleted": True}, message="Income entry deleted.")
