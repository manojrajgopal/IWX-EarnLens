"""Translate an :class:`IncomeFilter` into a MongoDB query document.

Centralizing this logic keeps the income repository and the analytics
repository consistent — both filter incomes the same way.
"""
from __future__ import annotations

from typing import Any, Dict

from app.core.constants import RecurrenceType
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.shared.datetime_utils import ensure_utc


def build_income_query(user_id: str, filters: IncomeFilter) -> Dict[str, Any]:
    """Build a scoped MongoDB query for a user's incomes."""
    query: Dict[str, Any] = {"user_id": user_id}

    if filters.income_type:
        query["income_type"] = filters.income_type.value
    if filters.recurrence:
        query["recurrence"] = filters.recurrence.value
    if filters.status:
        query["status"] = filters.status.value
    if filters.payment_mode:
        query["payment_mode"] = filters.payment_mode.value
    if filters.category_id:
        query["category_id"] = filters.category_id
    if filters.source_id:
        query["source_id"] = filters.source_id
    if filters.currency:
        query["currency"] = filters.currency.upper()

    if filters.tag_id:
        query["tag_ids"] = filters.tag_id
    elif filters.tag_ids:
        query["tag_ids"] = {"$in": filters.tag_ids}

    if filters.is_recurring is not None:
        if filters.is_recurring:
            query["recurrence"] = {"$ne": RecurrenceType.ONE_TIME.value}
        else:
            query["recurrence"] = RecurrenceType.ONE_TIME.value

    if filters.top_level:
        query["is_auto_generated"] = {"$ne": True}

    amount_query: Dict[str, Any] = {}
    if filters.min_amount is not None:
        amount_query["$gte"] = filters.min_amount
    if filters.max_amount is not None:
        amount_query["$lte"] = filters.max_amount
    if amount_query:
        query["amount"] = amount_query

    date_query: Dict[str, Any] = {}
    if filters.start_date:
        date_query["$gte"] = ensure_utc(filters.start_date)
    if filters.end_date:
        date_query["$lte"] = ensure_utc(filters.end_date)
    if date_query:
        query["payment_date"] = date_query

    if filters.search:
        query["$text"] = {"$search": filters.search}

    return query
