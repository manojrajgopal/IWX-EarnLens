"""Unit tests for the income query builder (pure function)."""
from datetime import datetime, timezone

from app.core.constants import IncomeType
from app.modules.incomes.schemas.filter_schemas import IncomeFilter
from app.modules.incomes.utils.query_builder import build_income_query


def test_basic_user_scoping() -> None:
    query = build_income_query("u1", IncomeFilter())
    assert query == {"user_id": "u1"}


def test_type_and_amount_filters() -> None:
    filters = IncomeFilter(income_type=IncomeType.SALARY, min_amount=100, max_amount=500)
    query = build_income_query("u1", filters)
    assert query["income_type"] == "salary"
    assert query["amount"] == {"$gte": 100, "$lte": 500}


def test_recurring_flag() -> None:
    query = build_income_query("u1", IncomeFilter(is_recurring=False))
    assert query["recurrence"] == "one_time"


def test_date_range() -> None:
    start = datetime(2024, 1, 1, tzinfo=timezone.utc)
    query = build_income_query("u1", IncomeFilter(start_date=start))
    assert "payment_date" in query
