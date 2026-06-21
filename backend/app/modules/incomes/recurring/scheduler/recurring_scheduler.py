"""Background scheduler that auto-generates due recurring income.

Implemented as a plain asyncio loop (no external scheduler dependency) wired
into the FastAPI application lifespan. It wakes on a fixed interval, asks the
:class:`RecurringIncomeService` to generate any occurrences that have come due,
then sleeps again until cancelled on shutdown.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging_config import get_logger
from app.modules.incomes.recurring.constants.update_scope import (
    SCHEDULER_INTERVAL_SECONDS,
)
from app.modules.incomes.recurring.services.recurring_service import (
    RecurringIncomeService,
)
from app.modules.incomes.repositories.income_repository import IncomeRepository

logger = get_logger("earnlens.incomes.scheduler")


class RecurringIncomeScheduler:
    """Owns the lifecycle of the recurring-income background task."""

    def __init__(
        self,
        db: AsyncIOMotorDatabase,
        *,
        interval_seconds: int = SCHEDULER_INTERVAL_SECONDS,
    ) -> None:
        self._db = db
        self._interval = interval_seconds
        self._task: Optional[asyncio.Task] = None
        self._stopping = asyncio.Event()

    def _service(self) -> RecurringIncomeService:
        return RecurringIncomeService(IncomeRepository(self._db))

    async def _run_once(self) -> None:
        try:
            await self._service().generate_due(datetime.now(timezone.utc))
        except Exception:  # never let a cycle crash the loop
            logger.exception("Recurring income generation cycle failed")

    async def _loop(self) -> None:
        logger.info("Recurring income scheduler started (interval=%ds)", self._interval)
        # Run an immediate catch-up pass on startup.
        await self._run_once()
        while not self._stopping.is_set():
            try:
                await asyncio.wait_for(self._stopping.wait(), timeout=self._interval)
            except asyncio.TimeoutError:
                await self._run_once()
        logger.info("Recurring income scheduler stopped")

    def start(self) -> None:
        if self._task is None or self._task.done():
            self._stopping.clear()
            self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        self._stopping.set()
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
