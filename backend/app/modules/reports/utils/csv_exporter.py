"""Reusable CSV serialization for income rows.

Isolated so additional formats (PDF, XLSX) can be added as sibling
modules without touching report-building logic.
"""
from __future__ import annotations

import csv
import io
from typing import Iterable

from app.modules.reports.schemas.report_schemas import ReportRow

_HEADERS = [
    "Title",
    "Amount",
    "Currency",
    "Type",
    "Recurrence",
    "Payment Date",
    "Source",
    "Category",
    "Status",
]


def rows_to_csv(rows: Iterable[ReportRow]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(_HEADERS)
    for row in rows:
        writer.writerow(
            [
                row.title,
                f"{row.amount:.2f}",
                row.currency,
                row.income_type,
                row.recurrence,
                row.payment_date.isoformat(),
                row.source_name,
                row.category,
                row.status,
            ]
        )
    return buffer.getvalue()
