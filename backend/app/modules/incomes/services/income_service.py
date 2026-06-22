"""Business logic for income entries (CRUD + scoped listing)."""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from app.core.constants import RecurrenceType
from app.core.exceptions import NotFoundError
from app.core.logging_config import get_logger
from app.modules.email.constants.email_events import EmailEvent
from app.modules.email.schemas.context_schemas import IncomeEmailContext
from app.modules.email.services.email_notifier import EmailNotifier
from app.modules.incomes.recurring.engine.recurrence_engine import is_recurring
from app.modules.incomes.recurring.services.recurring_service import (
    RecurringIncomeService,
)
from app.modules.incomes.repositories.income_repository import IncomeRepository
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.schemas.income_schemas import IncomeCreate, IncomeUpdate
from app.modules.incomes.utils.query_builder import build_income_query
from app.modules.users.repositories.user_repository import UserRepository
from app.shared.pagination import PageParams

logger = get_logger(__name__)


class IncomeService:
    """Owns income use cases; never touches MongoDB directly."""

    def __init__(
        self,
        repository: IncomeRepository,
        users: Optional[UserRepository] = None,
        email_notifier: Optional[EmailNotifier] = None,
    ) -> None:
        self.repository = repository
        self.users = users
        self.email = email_notifier

    async def create(self, user_id: str, payload: IncomeCreate) -> Dict[str, Any]:
        data = payload.model_dump()
        if self._is_auto_recurring(data):
            recurring = RecurringIncomeService(self.repository)
            created = await recurring.create_series(user_id, data)
        else:
            data["user_id"] = user_id
            data["next_run_at"] = None
            created = await self.repository.create(data)
        await self._notify_income(user_id, EmailEvent.INCOME_CREATED, created)
        return created

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
        await self._notify_income(user_id, EmailEvent.INCOME_UPDATED, updated)
        return updated

    async def delete(self, user_id: str, income_id: str) -> None:
        income = await self.get(user_id, income_id)  # ownership + snapshot
        deleted = await self.repository.delete_owned(income_id, user_id)
        if not deleted:
            raise NotFoundError("Income entry not found.")
        await self._notify_income(user_id, EmailEvent.INCOME_DELETED, income)

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

    # ------------------------------------------------------------------ #
    # Email notifications (best-effort, never block the operation)
    # ------------------------------------------------------------------ #
    async def _notify_income(
        self, user_id: str, event: EmailEvent, income: Dict[str, Any]
    ) -> None:
        if self.email is None or self.users is None:
            return
        try:
            user = await self.users.get_by_id(user_id)
            if not user:
                return
            payment_date = income.get("payment_date")
            context = IncomeEmailContext(
                email=user["email"],
                full_name=user.get("full_name", ""),
                title=income.get("title", "Income"),
                amount=float(income.get("amount", 0) or 0),
                currency=income.get("currency", "INR"),
                income_type=str(income.get("income_type", "")),
                status=str(income.get("status", "")),
                payment_date=str(payment_date)[:10] if payment_date else "",
            )
            await self.email.notify(user_id, event, context)
        except Exception as exc:  # noqa: BLE001 - email must not break income ops
            logger.warning("Income email (%s) failed: %s", event, exc)
