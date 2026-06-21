"""HTTP routes for report generation and export."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_current_user
from app.core.constants import IncomeType, RecurrenceType
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.reports.dependencies.report_dependencies import get_report_service
from app.modules.reports.schemas.report_schemas import IncomeReport
from app.modules.reports.services.report_service import ReportService
from app.modules.reports.utils.csv_exporter import rows_to_csv
from app.shared.schemas import APIResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


def report_filters(
    income_type: Optional[IncomeType] = Query(default=None),
    recurrence: Optional[RecurrenceType] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
    source_id: Optional[str] = Query(default=None),
    currency: Optional[str] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
) -> IncomeFilter:
    return IncomeFilter(
        income_type=income_type,
        recurrence=recurrence,
        category_id=category_id,
        source_id=source_id,
        currency=currency,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/generate", response_model=APIResponse[IncomeReport])
async def generate_report(
    filters: IncomeFilter = Depends(report_filters),
    user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> APIResponse[IncomeReport]:
    currency = filters.currency or user.get("default_currency", "INR")
    report = await service.build(user["id"], filters, currency)
    return APIResponse(data=report)


@router.get("/export/csv")
async def export_csv(
    filters: IncomeFilter = Depends(report_filters),
    user=Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> StreamingResponse:
    rows = await service.rows_only(user["id"], filters)
    content = rows_to_csv(rows)
    return StreamingResponse(
        iter([content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=earnlens-report.csv"},
    )
