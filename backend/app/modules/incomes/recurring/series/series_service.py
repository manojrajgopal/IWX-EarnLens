"""Use cases for reading a recurring income series (parent + occurrences)."""
from __future__ import annotations

from typing import Any, Dict, List, Tuple

from app.core.exceptions import NotFoundError
from app.modules.incomes.recurring.series.series_schemas import SeriesSummary
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.shared.pagination import PageParams


class IncomeSeriesService:
    """Read-only access to the occurrences that make up a recurring series."""

    def __init__(self, repository: IncomeRepository) -> None:
        self.repository = repository

    async def _resolve_parent(self, user_id: str, income_id: str) -> Dict[str, Any]:
        """Return the series template document for any income in the series.

        Works whether ``income_id`` points at the template itself or at one
        of its auto-generated children.
        """
        income = await self.repository.get_owned(income_id, user_id)
        if not income:
            raise NotFoundError("Income entry not found.")
        parent_id = income.get("recurring_parent_id") or income["id"]
        if parent_id == income["id"]:
            return income
        parent = await self.repository.get_owned(parent_id, user_id)
        return parent or income

    async def list_occurrences(
        self, user_id: str, income_id: str, page: PageParams
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Paginated list of every occurrence in the income's series."""
        parent = await self._resolve_parent(user_id, income_id)
        parent_id = parent["id"]
        items = await self.repository.list_series(
            parent_id, user_id, skip=page.skip, limit=page.limit
        )
        total = await self.repository.count_series(parent_id, user_id)
        return items, total

    async def summary(self, user_id: str, income_id: str) -> SeriesSummary:
        """Aggregate roll-up for the income's series."""
        parent = await self._resolve_parent(user_id, income_id)
        parent_id = parent["id"]
        stats = await self.repository.series_stats(parent_id, user_id)
        return SeriesSummary(
            parent_id=parent_id,
            occurrence_count=int(stats.get("occurrence_count", 0)),
            generated_count=int(stats.get("generated_count", 0)),
            total_amount=float(stats.get("total_amount", 0.0)),
            currency=parent.get("currency", "USD"),
            first_date=stats.get("first_date"),
            last_date=stats.get("last_date"),
            next_run_at=parent.get("next_run_at"),
        )
