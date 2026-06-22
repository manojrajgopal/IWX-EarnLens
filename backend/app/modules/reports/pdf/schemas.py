"""Request schema for the cinematic PDF export endpoint.

Field names mirror the frontend ``ReportOptions`` object via a camelCase
alias generator, so the Angular dialog can POST its options object verbatim.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

ReportThemeId = Literal["midnight", "aurora", "noir", "classic"]
ReportPageSize = Literal["A4", "LETTER"]
ReportDensity = Literal["comfortable", "compact"]


class ReportSections(BaseModel):
    """Toggleable document chapters (cover is always rendered)."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    cover: bool = True
    summary: bool = True
    categories: bool = True
    types: bool = True
    trend: bool = True
    ledger: bool = True


class ReportExportRequest(BaseModel):
    """The full set of cinematic preferences captured by the dialog."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = "Income Intelligence Report"
    subtitle: str = "A cinematic ledger of your earnings"
    prepared_for: str = ""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    theme_id: ReportThemeId = "midnight"
    page_size: ReportPageSize = "A4"
    density: ReportDensity = "comfortable"
    include_logo: bool = True
    include_cover_note: bool = False
    cover_note: str = ""
    sections: ReportSections = Field(default_factory=ReportSections)
    ledger_limit: int = 0
    file_name: str = "earnlens-report"

    def safe_file_name(self) -> str:
        """Sanitised download filename ending in ``.pdf``."""
        import re

        slug = re.sub(r"[^a-z0-9_-]+", "-", (self.file_name or "").lower()).strip("-")
        slug = slug or "earnlens-report"
        return f"{slug}.pdf"
