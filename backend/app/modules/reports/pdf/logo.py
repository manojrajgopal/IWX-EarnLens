"""Logo asset loading and tinting for the cinematic report.

The uploaded IWX seal (``assets/iwx-logo.png``) is black-on-transparent, which
reads well on light page chrome but disappears on the dark cinematic cover.
We therefore expose both the original mark and a white-tinted variant.
"""
from __future__ import annotations

import io
import os
from functools import lru_cache
from typing import Optional

from reportlab.lib.utils import ImageReader

_LOGO_PATH = os.path.join(os.path.dirname(__file__), "assets", "iwx-logo.png")
_WHITE_CUTOFF = 238  # luminance above which a pixel is treated as background


@lru_cache(maxsize=1)
def _raw_bytes() -> Optional[bytes]:
    try:
        with open(_LOGO_PATH, "rb") as fh:
            return fh.read()
    except OSError:
        return None


@lru_cache(maxsize=1)
def original_logo() -> Optional[ImageReader]:
    """The uploaded logo as-is (white background intact)."""
    data = _raw_bytes()
    return ImageReader(io.BytesIO(data)) if data else None


@lru_cache(maxsize=8)
def recolored_logo(hex_color: str) -> Optional[ImageReader]:
    """Return the seal recoloured to ``hex_color`` with its white backdrop
    knocked out, so it sits cleanly on any surface.
    """
    data = _raw_bytes()
    if not data:
        return None
    try:
        from PIL import Image

        src = Image.open(io.BytesIO(data)).convert("RGBA")
        h = hex_color.lstrip("#")
        tr, tg, tb = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        out_pixels = []
        for r, g, b, a in src.getdata():
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum >= _WHITE_CUTOFF:
                out_pixels.append((tr, tg, tb, 0))
            else:
                alpha = int(a * (1.0 - lum / 255.0))
                out_pixels.append((tr, tg, tb, alpha))
        out = Image.new("RGBA", src.size)
        out.putdata(out_pixels)
        buffer = io.BytesIO()
        out.save(buffer, format="PNG")
        buffer.seek(0)
        return ImageReader(buffer)
    except Exception:
        return original_logo()


def tinted_logo(hex_color: str) -> Optional[ImageReader]:
    """Backwards-compatible alias used by the cover builder."""
    return recolored_logo(hex_color)
