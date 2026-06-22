"""Shared layout constants and the render context passed to every builder."""
from __future__ import annotations

from dataclasses import dataclass

from reportlab.lib.pagesizes import A4, LETTER

from .theme import Palette

# ── Fonts (built-ins; Times stands in for the frontend's Georgia serif) ──────
SERIF = "Times-Roman"
SERIF_BOLD = "Times-Bold"
SERIF_ITALIC = "Times-Italic"
SANS = "Helvetica"
SANS_BOLD = "Helvetica-Bold"
SANS_OBLIQUE = "Helvetica-Oblique"

# ── Page geometry ────────────────────────────────────────────────────────────
MARGIN_X = 44.0
MARGIN_TOP = 96.0
MARGIN_BOTTOM = 70.0

_PAGE_SIZES = {"A4": A4, "LETTER": LETTER}


def page_size(name: str):
    """Return the ``(width, height)`` tuple for the requested paper size."""
    return _PAGE_SIZES.get(name, A4)


@dataclass(frozen=True)
class RenderContext:
    """Everything a builder needs to draw a faithful cinematic page."""

    palette: Palette
    currency: str
    theme_id: str
    density: str
    page_width: float
    page_height: float

    @property
    def content_width(self) -> float:
        return self.page_width - 2 * MARGIN_X

    @property
    def content_x(self) -> float:
        return MARGIN_X

    @property
    def row_padding(self) -> float:
        return 4.0 if self.density == "compact" else 7.0
