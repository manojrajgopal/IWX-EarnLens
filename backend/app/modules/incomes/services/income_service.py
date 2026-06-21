"""Business logic for income entries (CRUD + scoped listing)."""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from app.core.constants import RecurrenceType
from app.core.exceptions import NotFoundError
from app.modules.incomes.recurring.engine.recurrence_engine import is_recurring
from app.modules.incomes.recurring.services.recurring_service import (
    RecurringIncomeService,
)
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.schemas.income_schemas import IncomeCreate, IncomeUpdate
from app.modules.incomes.utils.query_builder import build_income_query
from app.shared.pagination import PageParams


class IncomeService:
    """Owns income use cases; never touches MongoDB directly."""

    def __init__(self, repository: IncomeRepository) -> None:
        self.repository = repository

    async def create(self, user_id: str, payload: IncomeCreate) -> Dict[str, Any]:
        data = payload.model_dump()
        if self._is_auto_recurring(data):
            recurring = RecurringIncomeService(self.repository)
            return await recurring.create_series(user_id, data)
        data["user_id"] = user_id
        data["next_run_at"] = None
        return await self.repository.create(data)

    @staticmethod
    def _is_auto_recurring(data: Dict[str, Any]) -> bool:
        """True when the entry should auto-generate (and back-fill) occurrences."""
        if not data.get("auto_add"):
            return False
        recurrence = data.get("recurrence")
        return recurrence is not None and is_recurring(RecurrenceType(recurrence))


    async def get(self, user_id: str, income_id: str) -> Dict[str, Any]:
        income = await self.repository.get_owned(income_id, user_id)
        if not income:
            raise NotFoundError("Income entry not found.")
        return income

    async def update(
        self, user_id: str, income_id: str, payload: IncomeUpdate
    ) -> Dict[str, Any]:
        await self.get(user_id, income_id)  # ownership check
        updates = payload.model_dump(exclude_none=True)
        updated = await self.repository.update(income_id, updates)
        if not updated:
            raise NotFoundError("Income entry not found.")
        return updated

    async def delete(self, user_id: str, income_id: str) -> None:
        deleted = await self.repository.delete_owned(income_id, user_id)
        if not deleted:
            raise NotFoundError("Income entry not found.")

    async def list(
        self,
        user_id: str,
        filters: IncomeFilter,
        page: PageParams,
        *,
        sort_field: str = "payment_date",
        sort_dir: int = -1,
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = build_income_query(user_id, filters)
        items = await self.repository.list_for_user(
            query, skip=page.skip, limit=page.limit, sort_field=sort_field, sort_dir=sort_dir
        )
        total = await self.repository.count(query)
        return items, total

    async def recent(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        return await self.repository.list_for_user(
            {"user_id": user_id}, skip=0, limit=limit
        )
