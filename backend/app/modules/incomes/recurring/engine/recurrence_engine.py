"""Pure date arithmetic for recurring income schedules.

Kept free of any database or framework dependency so it can be unit-tested in
isolation and reused by both the scheduler and the occurrence generator.
"""
from __future__ import annotations

from calendar import monthrange
from datetime import datetime, timedelta
from typing import List, Optional

from app.core.constants import RecurrenceType
from app.modules.incomes.recurring.constants.update_scope import (
    MAX_DAY_OF_MONTH,
    MIN_DAY_OF_MONTH,
)

# Recurrence values that represent a repeating schedule.
RECURRING_VALUES = {
    RecurrenceType.DAILY,
    RecurrenceType.WEEKLY,
    RecurrenceType.MONTHLY,
    RecurrenceType.QUARTERLY,
    RecurrenceType.YEARLY,
    RecurrenceType.CUSTOM,
}

# Recurrence values aligned to a specific day of the month.
MONTH_ALIGNED_VALUES = {
    RecurrenceType.MONTHLY,
    RecurrenceType.QUARTERLY,
    RecurrenceType.YEARLY,
}


def is_recurring(recurrence: RecurrenceType) -> bool:
    """True when the recurrence represents a repeating schedule."""
    return recurrence in RECURRING_VALUES


def is_month_aligned(recurrence: RecurrenceType) -> bool:
    """True when the recurrence is pinned to a day of the month."""
    return recurrence in MONTH_ALIGNED_VALUES


def clamp_day_of_month(day: Optional[int]) -> int:
    """Constrain a day-of-month into the always-valid 1..28 window."""
    if day is None:
        return MIN_DAY_OF_MONTH
    return max(MIN_DAY_OF_MONTH, min(MAX_DAY_OF_MONTH, day))


def _add_months(value: datetime, months: int) -> datetime:
    """Add a whole number of months, clamping the day to the month length."""
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def next_occurrence(
    recurrence: RecurrenceType,
    current: datetime,
    *,
    day_of_month: Optional[int] = None,
) -> Optional[datetime]:
    """Return the next scheduled datetime after ``current``.

    For month-aligned recurrences the resulting day is pinned to
    ``day_of_month`` (clamped to 1..28). Non-recurring schedules return
    ``None``.
    """
    if not is_recurring(recurrence):
        return None

    if recurrence == RecurrenceType.DAILY:
        return current + timedelta(days=1)
    if recurrence == RecurrenceType.WEEKLY:
        return current + timedelta(weeks=1)

    if recurrence == RecurrenceType.MONTHLY:
        nxt = _add_months(current, 1)
    elif recurrence == RecurrenceType.QUARTERLY:
        nxt = _add_months(current, 3)
    elif recurrence == RecurrenceType.YEARLY:
        nxt = _add_months(current, 12)
    else:  # CUSTOM — default to a monthly cadence.
        nxt = _add_months(current, 1)

    if is_month_aligned(recurrence) and day_of_month is not None:
        safe_day = clamp_day_of_month(day_of_month)
        nxt = nxt.replace(day=safe_day)
    return nxt


def upcoming_occurrences(
    recurrence: RecurrenceType,
    start: datetime,
    count: int,
    *,
    day_of_month: Optional[int] = None,
    end: Optional[datetime] = None,
) -> List[datetime]:
    """Project up to ``count`` future occurrence datetimes from ``start``."""
    if not is_recurring(recurrence) or count <= 0:
        return []

    results: List[datetime] = []
    cursor = start
    if is_month_aligned(recurrence) and day_of_month is not None:
        cursor = cursor.replace(day=clamp_day_of_month(day_of_month))

    for _ in range(count):
        if end is not None and cursor > end:
            break
        results.append(cursor)
        nxt = next_occurrence(recurrence, cursor, day_of_month=day_of_month)
        if nxt is None:
            break
        cursor = nxt
    return results


def align_first(
    recurrence: RecurrenceType,
    anchor: datetime,
    *,
    day_of_month: Optional[int] = None,
) -> datetime:
    """Return the first occurrence datetime for a schedule anchored at ``anchor``.

    For month-aligned recurrences the day is pinned to ``day_of_month`` so the
    series lands on a consistent pay-day each month.
    """
    if is_month_aligned(recurrence) and day_of_month is not None:
        return anchor.replace(day=clamp_day_of_month(day_of_month))
    return anchor


def occurrences_until(
    recurrence: RecurrenceType,
    first: datetime,
    until: datetime,
    *,
    day_of_month: Optional[int] = None,
    limit: int = 600,
) -> List[datetime]:
    """Every occurrence from ``first`` up to and including ``until``.

    Used to back-fill all already-due payments at creation time. ``first`` must
    already be aligned (see :func:`align_first`). A ``limit`` guards against
    runaway generation on misconfigured high-frequency schedules.
    """
    if first > until:
        return []
    if not is_recurring(recurrence):
        return [first]

    results: List[datetime] = []
    cursor = first
    count = 0
    while cursor <= until and count < limit:
        results.append(cursor)
        nxt = next_occurrence(recurrence, cursor, day_of_month=day_of_month)
        if nxt is None:
            break
        cursor = nxt
        count += 1
    return results

