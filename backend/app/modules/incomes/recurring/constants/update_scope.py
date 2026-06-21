"""Constants for the recurring-income subsystem."""
from __future__ import annotations

from enum import Enum


class UpdateScope(str, Enum):
    """How far a scoped update to a recurring income series should reach.

    Past, already-recorded occurrences are protected for every scope except
    :attr:`ALL`, which deliberately rewrites the entire history.
    """

    ALL = "all"
    THIS_MONTH = "this_month"
    THIS_AND_FUTURE = "this_and_future"
    FUTURE_ONLY = "future_only"


# Day-of-month must stay within 1..28 so a recurring entry can land in every
# calendar month (February included) without overflow.
MIN_DAY_OF_MONTH = 1
MAX_DAY_OF_MONTH = 28

# How often the background scheduler wakes up to look for due occurrences.
SCHEDULER_INTERVAL_SECONDS = 3600
