"""Dependency providers for the income module."""
from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_db, get_user_repository
from app.modules.email.dependencies.email_dependencies import get_email_notifier
from app.modules.email.services.email_notifier import EmailNotifier
from app.modules.incomes.recurring.series.series_service import IncomeSeriesService
from app.modules.incomes.recurring.services.recurring_service import (
    RecurringIncomeService,
)
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.modules.incomes.services.income_service import IncomeService
from app.modules.users.repositories.user_repository import UserRepository


def get_income_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> IncomeRepository:
    return IncomeRepository(db)


def get_income_service(
    repo: IncomeRepository = Depends(get_income_repository),
    users: UserRepository = Depends(get_user_repository),
    email_notifier: EmailNotifier = Depends(get_email_notifier),
) -> IncomeService:
    return IncomeService(repo, users, email_notifier)


def get_recurring_income_service(
    repo: IncomeRepository = Depends(get_income_repository),
) -> RecurringIncomeService:
    return RecurringIncomeService(repo)


def get_income_series_service(
    repo: IncomeRepository = Depends(get_income_repository),
) -> IncomeSeriesService:
    return IncomeSeriesService(repo)
