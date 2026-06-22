"""Shared layout constants and the render context passed to every builder."""
from __future__ import annotations

import os
from dataclasses import dataclass

from reportlab.lib.pagesizes import A4, LETTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from .theme import Palette

# ── Fonts ────────────────────────────────────────────────────────────────────
# The built-in Type-1 fonts (Times/Helvetica) lack a glyph for several currency
# symbols (notably the Indian Rupee ₹, U+20B9), which render as a hollow box.
# We bundle the open-source DejaVu Serif/Sans families — full Unicode coverage —
# and register them so every glyph, including ₹, renders correctly. If the TTFs
# are unavailable for any reason we fall back to the built-ins.

_FONT_DIR = os.path.join(os.path.dirname(__file__), "assets", "fonts")

# Logical names used across the renderer.
SERIF = "Times-Roman"
SERIF_BOLD = "Times-Bold"
SERIF_ITALIC = "Times-Italic"
SANS = "Helvetica"
SANS_BOLD = "Helvetica-Bold"
SANS_OBLIQUE = "Helvetica-Oblique"


def _register_unicode_fonts() -> None:
    """Register the bundled DejaVu families and repoint the font constants."""
    global SERIF, SERIF_BOLD, SERIF_ITALIC, SANS, SANS_BOLD, SANS_OBLIQUE
    faces = {
        "IWX-Serif": "DejaVuSerif.ttf",
        "IWX-Serif-Bold": "DejaVuSerif-Bold.ttf",
        "IWX-Serif-Italic": "DejaVuSerif-Italic.ttf",
        "IWX-Serif-BoldItalic": "DejaVuSerif-BoldItalic.ttf",
        "IWX-Sans": "DejaVuSans.ttf",
        "IWX-Sans-Bold": "DejaVuSans-Bold.ttf",
        "IWX-Sans-Oblique": "DejaVuSans-Oblique.ttf",
        "IWX-Sans-BoldOblique": "DejaVuSans-BoldOblique.ttf",
    }
    for name, filename in faces.items():
        path = os.path.join(_FONT_DIR, filename)
        if not os.path.exists(path):
            return  # incomplete bundle → keep the built-in fallbacks
        if name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(name, path))

    pdfmetrics.registerFontFamily(
        "IWX-Serif", normal="IWX-Serif", bold="IWX-Serif-Bold",
        italic="IWX-Serif-Italic", boldItalic="IWX-Serif-BoldItalic")
    pdfmetrics.registerFontFamily(
        "IWX-Sans", normal="IWX-Sans", bold="IWX-Sans-Bold",
        italic="IWX-Sans-Oblique", boldItalic="IWX-Sans-BoldOblique")

    SERIF = "IWX-Serif"
    SERIF_BOLD = "IWX-Serif-Bold"
    SERIF_ITALIC = "IWX-Serif-Italic"
    SANS = "IWX-Sans"
    SANS_BOLD = "IWX-Sans-Bold"
    SANS_OBLIQUE = "IWX-Sans-Oblique"


try:
    _register_unicode_fonts()
except Exception:  # pragma: no cover - never let font setup break rendering
    pass

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
