"""Controller mapping income service output into API schemas."""
from __future__ import annotations

from typing import List, Tuple

from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.schemas.income_schemas import (
    IncomeCreate,
    IncomePublic,
    IncomeUpdate,
)
from app.modules.incomes.services.income_service import IncomeService
from app.shared.pagination import PageParams


class IncomeController:
    def __init__(self, service: IncomeService) -> None:
        self.service = service

    async def create(self, user_id: str, payload: IncomeCreate) -> IncomePublic:
        income = await self.service.create(user_id, payload)
        return IncomePublic.model_validate(income)

    async def get(self, user_id: str, income_id: str) -> IncomePublic:
        income = await self.service.get(user_id, income_id)
        return IncomePublic.model_validate(income)

    async def update(
        self, user_id: str, income_id: str, payload: IncomeUpdate
    ) -> IncomePublic:
        income = await self.service.update(user_id, income_id, payload)
        return IncomePublic.model_validate(income)

    async def delete(self, user_id: str, income_id: str) -> None:
        await self.service.delete(user_id, income_id)

    async def list(
        self, user_id: str, filters: IncomeFilter, page: PageParams
    ) -> Tuple[List[IncomePublic], int]:
        items, total = await self.service.list(user_id, filters, page)
        return [IncomePublic.model_validate(i) for i in items], total
