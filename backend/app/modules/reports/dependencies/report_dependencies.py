"""Dependency providers for the reports module."""
from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_db
from app.modules.analytics.dependencies.analytics_dependencies import (
    get_analytics_service,
)
from app.modules.analytics.services.analytics_service import AnalyticsService
from app.modules.categories.services.category_service import CategoryRepository
from app.modules.incomes.dependencies.income_dependencies import get_income_service
from app.modules.incomes.services.income_service import IncomeService
from app.modules.reports.services.report_service import ReportService


def get_report_service(
    db: AsyncIOMotorDatabase = Depends(get_db),
    income_service: IncomeService = Depends(get_income_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> ReportService:
    return ReportService(income_service, analytics_service, CategoryRepository(db))
