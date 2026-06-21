"""Period boundary helpers used by dashboard period summaries."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone


def _now() -> datetime:
    return datetime.now(timezone.utc)


def start_of_week(reference: datetime | None = None) -> datetime:
    ref = reference or _now()
    monday = ref - timedelta(days=ref.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


def start_of_month(reference: datetime | None = None) -> datetime:
    ref = reference or _now()
    return ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def start_of_quarter(reference: datetime | None = None) -> datetime:
    ref = reference or _now()
    quarter_start_month = 3 * ((ref.month - 1) // 3) + 1
    return ref.replace(
        month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0
    )


def start_of_year(reference: datetime | None = None) -> datetime:
    ref = reference or _now()
    return ref.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)


def format_period_label(period: datetime, unit: str) -> str:
    """Human-friendly label for a bucketed period.

    Labels are derived from the *start* of each bucket so they stay
    consistent with the bucket boundaries used for aggregation.
    """
    if unit == "day":
        return period.strftime("%d %b")
    if unit == "week":
        # ``period`` is the Monday that starts the week bucket.
        return period.strftime("%d %b")
    if unit == "month":
        return period.strftime("%b %Y")
    if unit == "quarter":
        quarter = (period.month - 1) // 3 + 1
        return f"Q{quarter} {period.year}"
    if unit == "year":
        return period.strftime("%Y")
    return period.isoformat()


def _next_period(period: datetime, unit: str) -> datetime:
    """Return the start of the bucket immediately after ``period``."""
    if unit == "day":
        return period + timedelta(days=1)
    if unit == "week":
        return period + timedelta(weeks=1)
    if unit == "month":
        if period.month == 12:
            return period.replace(year=period.year + 1, month=1)
        return period.replace(month=period.month + 1)
    if unit == "quarter":
        month = period.month + 3
        year = period.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        return period.replace(year=year, month=month)
    if unit == "year":
        return period.replace(year=period.year + 1)
    return period


def fill_period_range(periods: list[datetime], unit: str) -> list[datetime]:
    """Return a continuous, gap-free list of bucket starts.

    ``$dateTrunc`` + ``$group`` only emit buckets that contain data, so
    sparse data collapses neighbouring days/weeks together. This expands a
    sorted list of present periods into every period between the first and
    last so the chart's x-axis stays evenly, chronologically spaced.

    A hard ceiling keeps pathological ranges (e.g. years of daily buckets)
    from exploding the payload; beyond it the original points are returned.
    """
    if len(periods) < 2:
        return list(periods)

    ordered = sorted(periods)
    start, end = ordered[0], ordered[-1]
    filled: list[datetime] = []
    cursor = start
    max_points = 750
    while cursor <= end and len(filled) < max_points:
        filled.append(cursor)
        cursor = _next_period(cursor, unit)

    # If we hit the ceiling, fall back to the raw (uneven) periods rather
    # than returning a truncated range that drops the latest data.
    if cursor <= end:
        return ordered
    return filled
