"""Dependency providers for the analytics module."""
from __future__ import annotations

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_db
from app.modules.analytics.repositories.analytics_repository import AnalyticsRepository
from app.modules.analytics.services.analytics_service import AnalyticsService
from app.modules.categories.services.category_service import CategoryRepository
from app.modules.sources.services.source_service import SourceRepository


def get_analytics_service(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> AnalyticsService:
    return AnalyticsService(
        AnalyticsRepository(db),
        CategoryRepository(db),
        SourceRepository(db),
    )
