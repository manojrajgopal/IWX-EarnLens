"""Analytics business logic: composes dashboard, distributions and graph.

This service is the brain of EarnLens. It orchestrates aggregation
queries and resolves human-friendly labels/colors so the frontend can
render charts directly from a normalized contract.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.constants import IncomeType
from app.modules.analytics.constants.analytics_constants import (
    DATE_TRUNC_UNIT,
    GroupBy,
)
from app.modules.analytics.repositories.analytics_repository import AnalyticsRepository
from app.modules.analytics.schemas.analytics_schemas import (
    DashboardSummary,
    DistributionItem,
    GraphPoint,
    GraphResponse,
    GraphSeries,
    GrowthMetric,
    PeriodSummary,
    RecurringSplit,
    TopSource,
    TotalsSummary,
)
from app.modules.analytics.utils.period_utils import (
    format_period_label,
    start_of_month,
    start_of_quarter,
    start_of_week,
    start_of_year,
)
from app.modules.categories.services.category_service import CategoryRepository
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.utils.query_builder import build_income_query
from app.modules.sources.services.source_service import SourceRepository

# Fields the unified graph can split its series by.
_SPLIT_FIELDS = {
    "income_type": None,
    "category_id": "category",
    "source_id": "source",
    "recurrence": None,
}


class AnalyticsService:
    def __init__(
        self,
        repository: AnalyticsRepository,
        category_repo: CategoryRepository,
        source_repo: SourceRepository,
    ) -> None:
        self.repo = repository
        self.category_repo = category_repo
        self.source_repo = source_repo

    # ------------------------------------------------------------------ #
    # Label/color resolution
    # ------------------------------------------------------------------ #
    async def _category_map(self, user_id: str) -> Dict[str, Dict[str, Any]]:
        items = await self.category_repo.list_for_user(user_id)
        return {i["id"]: i for i in items}

    async def _source_map(self, user_id: str) -> Dict[str, Dict[str, Any]]:
        items = await self.source_repo.list_for_user(user_id)
        return {i["id"]: i for i in items}

    # ------------------------------------------------------------------ #
    # Dashboard
    # ------------------------------------------------------------------ #
    async def dashboard(
        self, user_id: str, filters: IncomeFilter, currency: str
    ) -> DashboardSummary:
        query = build_income_query(user_id, filters)
        cat_map = await self._category_map(user_id)
        src_map = await self._source_map(user_id)

        totals = await self._totals(query)
        recurring = await self._recurring(query)
        periods = await self._periods(user_id, filters)
        growth = await self._growth(user_id, filters)
        by_category = await self._distribution(query, "category_id", cat_map, totals.total)
        by_source = await self._distribution(query, "source_id", src_map, totals.total)
        by_type = await self._type_distribution(query, totals.total)
        top = await self._top_sources(query, src_map)
        trend = await self._trend(query, GroupBy.MONTH)

        return DashboardSummary(
            totals=totals,
            recurring=recurring,
            periods=periods,
            growth=growth,
            by_category=by_category,
            by_source=by_source,
            by_type=by_type,
            top_sources=top,
            trend=trend,
            currency=currency,
            generated_at=datetime.now(timezone.utc),
        )

    async def _totals(self, query: Dict[str, Any]) -> TotalsSummary:
        row = await self.repo.totals(query)
        if not row:
            return TotalsSummary()
        return TotalsSummary(
            total=round(row.get("total", 0.0), 2),
            count=row.get("count", 0),
            average=round(row.get("average", 0.0) or 0.0, 2),
            minimum=round(row.get("minimum", 0.0) or 0.0, 2),
            maximum=round(row.get("maximum", 0.0) or 0.0, 2),
        )

    async def _recurring(self, query: Dict[str, Any]) -> RecurringSplit:
        rows = await self.repo.recurring_split(query)
        split = RecurringSplit()
        for row in rows:
            if row["_id"] == "recurring":
                split.recurring_total = round(row["total"], 2)
                split.recurring_count = row["count"]
            else:
                split.one_time_total = round(row["total"], 2)
                split.one_time_count = row["count"]
        return split

    async def _periods(self, user_id: str, filters: IncomeFilter) -> PeriodSummary:
        async def total_since(start: datetime) -> float:
            scoped = filters.model_copy(update={"start_date": start, "end_date": None})
            return await self.repo.period_total(build_income_query(user_id, scoped))

        return PeriodSummary(
            this_week=round(await total_since(start_of_week()), 2),
            this_month=round(await total_since(start_of_month()), 2),
            this_quarter=round(await total_since(start_of_quarter()), 2),
            this_year=round(await total_since(start_of_year()), 2),
        )

    async def _growth(self, user_id: str, filters: IncomeFilter) -> GrowthMetric:
        """Compare current month against the previous month."""
        current_start = start_of_month()
        # Previous month start.
        prev_month = (current_start.month - 2) % 12 + 1
        prev_year = current_start.year - 1 if current_start.month == 1 else current_start.year
        prev_start = current_start.replace(year=prev_year, month=prev_month)

        cur_filter = filters.model_copy(
            update={"start_date": current_start, "end_date": None}
        )
        prev_filter = filters.model_copy(
            update={"start_date": prev_start, "end_date": current_start}
        )
        current = await self.repo.period_total(build_income_query(user_id, cur_filter))
        previous = await self.repo.period_total(build_income_query(user_id, prev_filter))

        change = current - previous
        change_percent = (change / previous * 100) if previous else 0.0
        return GrowthMetric(
            current=round(current, 2),
            previous=round(previous, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
        )

    async def _distribution(
        self,
        query: Dict[str, Any],
        field: str,
        label_map: Dict[str, Dict[str, Any]],
        grand_total: float,
    ) -> List[DistributionItem]:
        rows = await self.repo.distribution(query, field)
        items: List[DistributionItem] = []
        for row in rows:
            key = row["_id"]
            meta = label_map.get(key) if key else None
            label = meta["name"] if meta else ("Uncategorized" if not key else key)
            total = round(row["total"], 2)
            items.append(
                DistributionItem(
                    key=str(key) if key else "none",
                    label=label,
                    total=total,
                    count=row["count"],
                    percentage=round(total / grand_total * 100, 2) if grand_total else 0.0,
                    color=meta.get("color") if meta else None,
                )
            )
        return items

    async def _type_distribution(
        self, query: Dict[str, Any], grand_total: float
    ) -> List[DistributionItem]:
        rows = await self.repo.distribution(query, "income_type")
        items: List[DistributionItem] = []
        for row in rows:
            key = row["_id"] or IncomeType.CUSTOM.value
            total = round(row["total"], 2)
            items.append(
                DistributionItem(
                    key=key,
                    label=str(key).replace("_", " ").title(),
                    total=total,
                    count=row["count"],
                    percentage=round(total / grand_total * 100, 2) if grand_total else 0.0,
                )
            )
        return items

    async def _top_sources(
        self, query: Dict[str, Any], src_map: Dict[str, Dict[str, Any]]
    ) -> List[TopSource]:
        rows = await self.repo.top_sources(query, limit=5)
        results: List[TopSource] = []
        for row in rows:
            ident = row["_id"]
            source_id = ident.get("source_id")
            label = ident.get("source_name")
            if not label and source_id and source_id in src_map:
                label = src_map[source_id]["name"]
            results.append(
                TopSource(
                    source_id=source_id,
                    label=label or "Unknown source",
                    total=round(row["total"], 2),
                    count=row["count"],
                )
            )
        return results

    async def _trend(self, query: Dict[str, Any], group_by: GroupBy) -> List[GraphPoint]:
        unit = DATE_TRUNC_UNIT[group_by]
        rows = await self.repo.time_series(query, group_by)
        points: List[GraphPoint] = []
        for row in rows:
            period: datetime = row["_id"]["period"]
            points.append(
                GraphPoint(
                    period=period.isoformat(),
                    label=format_period_label(period, unit),
                    total=round(row["total"], 2),
                    count=row["count"],
                )
            )
        return points

    # ------------------------------------------------------------------ #
    # Unified graph
    # ------------------------------------------------------------------ #
    async def graph(
        self,
        user_id: str,
        filters: IncomeFilter,
        group_by: GroupBy,
        split_by: Optional[str] = None,
    ) -> GraphResponse:
        query = build_income_query(user_id, filters)
        unit = DATE_TRUNC_UNIT[group_by]
        split_field = split_by if split_by in _SPLIT_FIELDS else None

        # Totals per period (always present — drives the primary line).
        total_rows = await self.repo.time_series(query, group_by)
        ordered_periods: List[datetime] = [r["_id"]["period"] for r in total_rows]
        labels = [format_period_label(p, unit) for p in ordered_periods]
        period_index = {p.isoformat(): idx for idx, p in enumerate(ordered_periods)}

        totals_by_period = [
            GraphPoint(
                period=r["_id"]["period"].isoformat(),
                label=format_period_label(r["_id"]["period"], unit),
                total=round(r["total"], 2),
                count=r["count"],
            )
            for r in total_rows
        ]

        series: List[GraphSeries] = []
        if split_field:
            series = await self._split_series(
                user_id, query, group_by, split_field, ordered_periods, unit, period_index
            )
        else:
            series = [
                GraphSeries(
                    key="total",
                    label="Total income",
                    color="#6366f1",
                    points=totals_by_period,
                )
            ]

        return GraphResponse(
            group_by=group_by,
            labels=labels,
            series=series,
            totals_by_period=totals_by_period,
        )

    async def _split_series(
        self,
        user_id: str,
        query: Dict[str, Any],
        group_by: GroupBy,
        split_field: str,
        ordered_periods: List[datetime],
        unit: str,
        period_index: Dict[str, int],
    ) -> List[GraphSeries]:
        rows = await self.repo.time_series(query, group_by, split_field=split_field)

        label_map: Dict[str, Dict[str, Any]] = {}
        if split_field == "category_id":
            label_map = await self._category_map(user_id)
        elif split_field == "source_id":
            label_map = await self._source_map(user_id)

        # Bucket rows by split key, pre-filling zero points for each period.
        buckets: Dict[str, List[GraphPoint]] = {}
        for row in rows:
            raw_key = row["_id"].get("split")
            key = str(raw_key) if raw_key not in (None, "") else "none"
            if key not in buckets:
                buckets[key] = [
                    GraphPoint(
                        period=p.isoformat(),
                        label=format_period_label(p, unit),
                        total=0.0,
                        count=0,
                    )
                    for p in ordered_periods
                ]
            period_iso = row["_id"]["period"].isoformat()
            idx = period_index.get(period_iso)
            if idx is not None:
                buckets[key][idx].total = round(row["total"], 2)
                buckets[key][idx].count = row["count"]

        series: List[GraphSeries] = []
        for key, points in buckets.items():
            meta = label_map.get(key)
            if meta:
                label = meta["name"]
                color = meta.get("color")
            elif key == "none":
                label, color = "Uncategorized", "#9ca3af"
            else:
                label, color = key.replace("_", " ").title(), None
            series.append(GraphSeries(key=key, label=label, color=color, points=points))
        return series
