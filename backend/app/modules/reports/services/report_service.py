"""Report-building service combining income rows with analytics summaries."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List

from app.modules.analytics.services.analytics_service import AnalyticsService
from app.modules.categories.services.category_service import CategoryRepository
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.services.income_service import IncomeService
from app.modules.reports.schemas.report_schemas import IncomeReport, ReportRow
from app.shared.pagination import PageParams


class ReportService:
    def __init__(
        self,
        income_service: IncomeService,
        analytics_service: AnalyticsService,
        category_repo: CategoryRepository,
    ) -> None:
        self.incomes = income_service
        self.analytics = analytics_service
        self.category_repo = category_repo

    async def _rows(self, user_id: str, filters: IncomeFilter) -> List[ReportRow]:
        cat_map = {
            c["id"]: c["name"] for c in await self.category_repo.list_for_user(user_id)
        }
        items, _ = await self.incomes.list(
            user_id, filters, PageParams(page=1, page_size=200)
        )
        rows: List[ReportRow] = []
        for item in items:
            rows.append(
                ReportRow(
                    title=item["title"],
                    amount=item["amount"],
                    currency=item.get("currency", "USD"),
                    income_type=item.get("income_type", ""),
                    recurrence=item.get("recurrence", ""),
                    payment_date=item["payment_date"],
                    source_name=item.get("source_name") or "",
                    category=cat_map.get(item.get("category_id"), ""),
                    status=item.get("status", ""),
                )
            )
        return rows

    async def build(
        self, user_id: str, filters: IncomeFilter, currency: str
    ) -> IncomeReport:
        summary = await self.analytics.dashboard(user_id, filters, currency)
        rows = await self._rows(user_id, filters)
        return IncomeReport(
            generated_at=datetime.now(timezone.utc),
            currency=currency,
            totals=summary.totals,
            by_category=summary.by_category,
            by_type=summary.by_type,
            trend=summary.trend,
            rows=rows,
        )

    async def rows_only(
        self, user_id: str, filters: IncomeFilter
    ) -> List[ReportRow]:
        return await self._rows(user_id, filters)
