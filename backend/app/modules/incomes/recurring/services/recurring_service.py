"""Business logic for recurring income: scoped updates and auto-generation."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.constants import IncomeStatus, RecurrenceType
from app.core.exceptions import NotFoundError
from app.core.logging_config import get_logger
from app.modules.incomes.recurring.constants.update_scope import UpdateScope
from app.modules.incomes.recurring.engine.occurrence_generator import build_occurrence
from app.modules.incomes.recurring.engine.recurrence_engine import (
    align_first,
    clamp_day_of_month,
    is_recurring,
    next_occurrence,
    occurrences_until,
)
from app.modules.incomes.recurring.schemas.recurring_schemas import ScopedUpdateChanges
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.shared.base_repository import to_object_id
from app.shared.datetime_utils import ensure_utc, utcnow

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

    # Hard cap on how many past occurrences a single creation may back-fill.
    MAX_BACKFILL = 600

    def __init__(self, repository: IncomeRepository) -> None:
        self.repository = repository

    # ------------------------------------------------------------------ #
    # Series creation (immediate back-fill of due occurrences)            #
    # ------------------------------------------------------------------ #
    async def create_series(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an auto-recurring income and back-fill every due payment.

        The template document is the first occurrence. Every additional
        occurrence whose pay-day has already passed (up to today, or the end
        date if earlier) is created immediately as its own record. The first
        occurrence still in the future becomes ``next_run_at`` for the
        scheduler to generate later.
        """
        now = utcnow()
        recurrence = RecurrenceType(data["recurrence"])
        day = data.get("day_of_month")
        end = ensure_utc(data["end_date"]) if data.get("end_date") else None

        anchor = data.get("start_date") or data.get("payment_date")
        anchor = ensure_utc(anchor)
        first = align_first(recurrence, anchor, day_of_month=day)

        # Generate every occurrence that is already due (<= now, and <= end).
        until = now if end is None else min(now, end)
        due_dates = occurrences_until(
            recurrence, first, until, day_of_month=day, limit=self.MAX_BACKFILL
        )
        child_dates = [d for d in due_dates if d > first]

        # The scheduler resumes from the first not-yet-recorded occurrence.
        last_recorded = child_dates[-1] if child_dates else first
        candidate = next_occurrence(recurrence, last_recorded, day_of_month=day)
        next_run_at = candidate if candidate and (end is None or candidate <= end) else None

        data["user_id"] = user_id
        data["payment_date"] = first
        data["end_date"] = end
        data["start_date"] = anchor
        data["is_auto_generated"] = False
        data["recurring_parent_id"] = None
        data["next_run_at"] = next_run_at
        if first > now:
            # A future first payment is scheduled, not yet received.
            data["status"] = IncomeStatus.SCHEDULED.value

        template = await self.repository.create(data)

        for occ_date in child_dates:
            await self.repository.create(build_occurrence(template, occ_date))

        if child_dates:
            logger.info(
                "Back-filled %d past occurrence(s) for new recurring income %s",
                len(child_dates),
                template.get("id"),
            )
        return template

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
        end = ensure_utc(end) if end else None
        day = template.get("day_of_month")
        run_at = template.get("next_run_at")
        run_at = ensure_utc(run_at) if run_at else None
        created = 0
        guard = 0  # prevent runaway loops on misconfigured data

        while run_at is not None and run_at <= now and guard < self.MAX_BACKFILL:
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
