"""Builds concrete income occurrence documents from a recurring template."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from app.core.constants import IncomeStatus

# Fields copied verbatim from the template onto each generated occurrence.
_INHERITED_FIELDS = (
    "title",
    "amount",
    "currency",
    "income_type",
    "recurrence",
    "payment_time",
    "day_of_month",
    "category_id",
    "source_id",
    "source_name",
    "tag_ids",
    "payment_mode",
    "platform",
    "client",
    "employer",
    "project_name",
    "reference_number",
    "notes",
    "tax_notes",
    "is_taxable",
)


def build_occurrence(template: Dict[str, Any], occurrence_date: datetime) -> Dict[str, Any]:
    """Create an income document for a single auto-generated occurrence.

    The generated document is a standalone, non-recurring entry linked back to
    its template via ``recurring_parent_id`` and flagged ``is_auto_generated``
    so it is never itself picked up by the scheduler.
    """
    parent_id = str(template.get("id") or template.get("_id"))
    doc: Dict[str, Any] = {
        "user_id": template["user_id"],
        "payment_date": occurrence_date,
        "status": IncomeStatus.RECEIVED.value,
        "start_date": None,
        "end_date": None,
        "auto_add": False,
        "is_auto_generated": True,
        "recurring_parent_id": parent_id,
        "next_run_at": None,
        "attachments": [],
        "custom_fields": [],
        "metadata": {"generated_from": parent_id},
    }
    for field in _INHERITED_FIELDS:
        if field in template:
            doc[field] = template[field]
    return doc
