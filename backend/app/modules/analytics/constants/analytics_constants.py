"""Analytics constants: supported aggregation granularities."""
from __future__ import annotations

from enum import Enum


class GroupBy(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class ChartStyle(str, Enum):
    LINE = "line"
    BAR = "bar"
    AREA = "area"
    STACKED = "stacked"


# Maps our GroupBy values onto MongoDB $dateTrunc units.
DATE_TRUNC_UNIT = {
    GroupBy.DAY: "day",
    GroupBy.WEEK: "week",
    GroupBy.MONTH: "month",
    GroupBy.QUARTER: "quarter",
    GroupBy.YEAR: "year",
}
