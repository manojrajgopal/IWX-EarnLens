"""Dependency providers for the income module."""
from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_db
from app.modules.incomes.recurring.services.recurring_service import (
    RecurringIncomeService,
)
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.modules.incomes.services.income_service import IncomeService


def get_income_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> IncomeRepository:
    return IncomeRepository(db)


def get_income_service(
    repo: IncomeRepository = Depends(get_income_repository),
) -> IncomeService:
    return IncomeService(repo)


def get_recurring_income_service(
    repo: IncomeRepository = Depends(get_income_repository),
) -> RecurringIncomeService:
    return RecurringIncomeService(repo)
