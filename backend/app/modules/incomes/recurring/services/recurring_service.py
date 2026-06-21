"""Business logic for recurring income: scoped updates and auto-generation."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.constants import RecurrenceType
from app.core.exceptions import NotFoundError
from app.core.logging_config import get_logger
from app.modules.incomes.recurring.constants.update_scope import UpdateScope
from app.modules.incomes.recurring.engine.occurrence_generator import build_occurrence
from app.modules.incomes.recurring.engine.recurrence_engine import (
    clamp_day_of_month,
    is_recurring,
    next_occurrence,
)
from app.modules.incomes.recurring.schemas.recurring_schemas import ScopedUpdateChanges
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.shared.base_repository import to_object_id

logger = get_logger("earnlens.incomes.recurring")

# Template fields whose new values future occurrences should inherit.
_TEMPLATE_DEFAULT_FIELDS = (
    "amount",
    "day_of_month",
    "payment_mode",
    "is_taxable",
    "notes",
    "payment_time",
)


def _month_bounds(now: datetime) -> tuple[datetime, datetime]:
    """Return [start_of_month, start_of_next_month) for ``now`` (UTC)."""
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        nxt = start.replace(year=start.year + 1, month=1)
    else:
        nxt = start.replace(month=start.month + 1)
    return start, nxt


class RecurringIncomeService:
    """Owns scoped editing and scheduled generation of recurring income."""

    def __init__(self, repository: IncomeRepository) -> None:
        self.repository = repository

    # ------------------------------------------------------------------ #
    # Scoped updates                                                     #
    # ------------------------------------------------------------------ #
    async def scoped_update(
        self,
        user_id: str,
        income_id: str,
        scope: UpdateScope,
        changes: ScopedUpdateChanges,
    ) -> int:
        """Apply ``changes`` to a recurring series within ``scope``.

        Past, already-recorded occurrences are never touched unless the scope
        is :attr:`UpdateScope.ALL`. Returns the number of affected documents.
        """
        income = await self.repository.get_owned(income_id, user_id)
        if not income:
            raise NotFoundError("Income entry not found.")

        series_id = income.get("recurring_parent_id") or income["id"]
        set_doc = self._mapped_changes(changes)
        if not set_doc:
            return 0
        set_doc["updated_at"] = datetime.now(timezone.utc)

        query = self._series_query(user_id, series_id)
        self._apply_scope_window(query, scope)

        result = await self.repository.collection.update_many(query, {"$set": set_doc})
        affected = result.modified_count

        # Forward-looking scopes also update the template so future
        # auto-generated occurrences inherit the new defaults.
        if scope in (UpdateScope.THIS_AND_FUTURE, UpdateScope.FUTURE_ONLY, UpdateScope.ALL):
            await self._sync_template_defaults(user_id, series_id, changes)

        return affected

    def _mapped_changes(self, changes: ScopedUpdateChanges) -> Dict[str, Any]:
        data = changes.model_dump(exclude_none=True)
        if "day_of_month" in data:
            data["day_of_month"] = clamp_day_of_month(data["day_of_month"])
        return data

    def _series_query(self, user_id: str, series_id: str) -> Dict[str, Any]:
        return {
            "user_id": user_id,
            "$or": [
                {"_id": to_object_id(series_id)},
                {"recurring_parent_id": series_id},
            ],
        }

    def _apply_scope_window(self, query: Dict[str, Any], scope: UpdateScope) -> None:
        now = datetime.now(timezone.utc)
        if scope == UpdateScope.ALL:
            return
        if scope == UpdateScope.THIS_MONTH:
            start, nxt = _month_bounds(now)
            query["payment_date"] = {"$gte": start, "$lt": nxt}
        elif scope == UpdateScope.THIS_AND_FUTURE:
            start, _ = _month_bounds(now)
            query["payment_date"] = {"$gte": start}
        elif scope == UpdateScope.FUTURE_ONLY:
            query["payment_date"] = {"$gt": now}

    async def _sync_template_defaults(
        self, user_id: str, series_id: str, changes: ScopedUpdateChanges
    ) -> None:
        data = changes.model_dump(exclude_none=True)
        defaults = {k: data[k] for k in _TEMPLATE_DEFAULT_FIELDS if k in data}
        if not defaults:
            return
        if "day_of_month" in defaults:
            defaults["day_of_month"] = clamp_day_of_month(defaults["day_of_month"])
        defaults["updated_at"] = datetime.now(timezone.utc)
        await self.repository.collection.update_one(
            {"_id": to_object_id(series_id), "user_id": user_id},
            {"$set": defaults},
        )

    # ------------------------------------------------------------------ #
    # Scheduled auto-generation                                          #
    # ------------------------------------------------------------------ #
    async def find_due_templates(self, now: datetime) -> List[Dict[str, Any]]:
        """Return recurring templates whose next run is due."""
        query = {
            "auto_add": True,
            "is_auto_generated": {"$ne": True},
            "next_run_at": {"$ne": None, "$lte": now},
        }
        return await self.repository.list(query, skip=0, limit=500)

    async def generate_due(self, now: Optional[datetime] = None) -> int:
        """Generate every occurrence that has come due. Returns count created."""
        now = now or datetime.now(timezone.utc)
        templates = await self.find_due_templates(now)
        created = 0
        for template in templates:
            created += await self._catch_up_template(template, now)
        if created:
            logger.info("Auto-generated %d recurring income occurrence(s)", created)
        return created

    async def _catch_up_template(self, template: Dict[str, Any], now: datetime) -> int:
        """Generate all missed occurrences for a single template up to ``now``."""
        recurrence = RecurrenceType(template["recurrence"])
        if not is_recurring(recurrence):
            await self._clear_next_run(template["id"])
            return 0

        end = template.get("end_date")
        day = template.get("day_of_month")
        run_at = template.get("next_run_at")
        created = 0
        guard = 0  # prevent runaway loops on misconfigured data

        while run_at is not None and run_at <= now and guard < 60:
            if end is not None and run_at > end:
                run_at = None
                break
            occurrence = build_occurrence(template, run_at)
            await self.repository.create(occurrence)
            created += 1
            guard += 1
            run_at = next_occurrence(recurrence, run_at, day_of_month=day)

        await self.repository.update(template["id"], {"next_run_at": run_at})
        return created

    async def _clear_next_run(self, income_id: str) -> None:
        await self.repository.update(income_id, {"next_run_at": None})
