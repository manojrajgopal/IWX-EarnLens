"""Aggregates every module router under a single API router.

Adding a new feature module is a one-line change here — the rest of the
application never needs to know about individual routers.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.modules.analytics.routers import router as analytics_router
from app.modules.audit.routers import router as audit_router
from app.modules.auth.routers import router as auth_router
from app.modules.categories.routers import router as categories_router
from app.modules.email.routers import router as email_router
from app.modules.incomes.routers import router as incomes_router
from app.modules.preferences.routers import router as preferences_router
from app.modules.reports.routers import router as reports_router
from app.modules.sources.routers import router as sources_router
from app.modules.tags.routers import router as tags_router
from app.modules.users.routers import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(incomes_router)
api_router.include_router(categories_router)
api_router.include_router(sources_router)
api_router.include_router(tags_router)
api_router.include_router(analytics_router)
api_router.include_router(reports_router)
api_router.include_router(preferences_router)
api_router.include_router(audit_router)
api_router.include_router(email_router)
