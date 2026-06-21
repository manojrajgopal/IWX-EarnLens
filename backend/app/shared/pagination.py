"""Pagination request parameters and helpers shared across modules."""
from __future__ import annotations

from dataclasses import dataclass

from app.shared.schemas import PaginationMeta


@dataclass
class PageParams:
    """Normalized pagination input."""

    page: int = 1
    page_size: int = 20

    def __post_init__(self) -> None:
        self.page = max(1, self.page)
        self.page_size = min(200, max(1, self.page_size))

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size

    def meta(self, total: int) -> PaginationMeta:
        total_pages = (total + self.page_size - 1) // self.page_size if total else 0
        return PaginationMeta(
            total=total,
            page=self.page,
            page_size=self.page_size,
            total_pages=total_pages,
        )
