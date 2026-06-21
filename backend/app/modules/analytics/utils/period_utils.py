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
    """Human-friendly label for a bucketed period."""
    if unit == "day":
        return period.strftime("%b %d")
    if unit == "week":
        return period.strftime("W%W %Y")
    if unit == "month":
        return period.strftime("%b %Y")
    if unit == "quarter":
        quarter = (period.month - 1) // 3 + 1
        return f"Q{quarter} {period.year}"
    if unit == "year":
        return period.strftime("%Y")
    return period.isoformat()
