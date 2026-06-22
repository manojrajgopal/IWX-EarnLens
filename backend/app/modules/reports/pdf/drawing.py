"""Low-level ReportLab canvas helpers — colours, gradients, rounded shapes.

These primitives translate the cinematic SVG techniques of the frontend
(gradients, soft glows, rounded panels, letter-spaced labels) into
ReportLab canvas operations.
"""
from __future__ import annotations

from typing import List, Optional, Sequence, Tuple

from reportlab.lib.colors import Color, HexColor
from reportlab.pdfgen.canvas import Canvas


# ── Colour maths ────────────────────────────────────────────────────────────

def hex_color(value: str, alpha: float = 1.0) -> Color:
    """Convert ``#rrggbb`` to a ReportLab :class:`Color` with optional alpha."""
    base = HexColor(value)
    return Color(base.red, base.green, base.blue, alpha=alpha)


def _channels(value: str) -> Tuple[float, float, float]:
    c = HexColor(value)
    return c.red, c.green, c.blue


def mix(value: str, target: str, amount: float) -> Color:
    """Mix ``value`` toward ``target`` by ``amount`` (0..1)."""
    r1, g1, b1 = _channels(value)
    r2, g2, b2 = _channels(target)
    t = max(0.0, min(1.0, amount))
    return Color(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)


def lighten(value: str, amount: float) -> Color:
    """Lighten ``value`` toward white by ``amount`` (0..1)."""
    return mix(value, "#ffffff", amount)


def darken(value: str, amount: float) -> Color:
    """Darken ``value`` toward black by ``amount`` (0..1)."""
    return mix(value, "#000000", amount)


def to_color(value) -> Color:
    """Accept a hex string or an existing Color and return a Color."""
    if isinstance(value, Color):
        return value
    return hex_color(value)


# ── Rounded rectangles & clipping ───────────────────────────────────────────

def rounded_rect_path(canvas: Canvas, x: float, y: float, w: float, h: float, r: float):
    """Build (and return) a rounded-rectangle path object."""
    r = min(r, w / 2.0, h / 2.0)
    p = canvas.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.arcTo(x + w - 2 * r, y, x + w, y + 2 * r, startAng=-90, extent=90)
    p.lineTo(x + w, y + h - r)
    p.arcTo(x + w - 2 * r, y + h - 2 * r, x + w, y + h, startAng=0, extent=90)
    p.lineTo(x + r, y + h)
    p.arcTo(x, y + h - 2 * r, x + 2 * r, y + h, startAng=90, extent=90)
    p.lineTo(x, y + r)
    p.arcTo(x, y, x + 2 * r, y + 2 * r, startAng=180, extent=90)
    p.close()
    return p


def fill_rounded_rect(canvas: Canvas, x: float, y: float, w: float, h: float,
                      r: float, color: Color) -> None:
    """Fill a rounded rectangle with a flat colour."""
    canvas.saveState()
    canvas.setFillColor(color)
    p = rounded_rect_path(canvas, x, y, w, h, r)
    canvas.drawPath(p, stroke=0, fill=1)
    canvas.restoreState()


def stroke_rounded_rect(canvas: Canvas, x: float, y: float, w: float, h: float,
                        r: float, color: Color, width: float = 1.0) -> None:
    """Stroke a rounded-rectangle outline."""
    canvas.saveState()
    canvas.setStrokeColor(color)
    canvas.setLineWidth(width)
    p = rounded_rect_path(canvas, x, y, w, h, r)
    canvas.drawPath(p, stroke=1, fill=0)
    canvas.restoreState()


def gradient_rounded_rect(canvas: Canvas, x: float, y: float, w: float, h: float,
                          r: float, colors: Sequence[Color],
                          positions: Optional[Sequence[float]] = None,
                          vertical: bool = False) -> None:
    """Fill a rounded rectangle with a linear gradient (clip + shading)."""
    canvas.saveState()
    p = rounded_rect_path(canvas, x, y, w, h, r)
    canvas.clipPath(p, stroke=0, fill=0)
    if vertical:
        canvas.linearGradient(x, y + h, x, y, list(colors), positions, extend=True)
    else:
        canvas.linearGradient(x, y, x + w, y, list(colors), positions, extend=True)
    canvas.restoreState()


def linear_gradient_rect(canvas: Canvas, x: float, y: float, w: float, h: float,
                         colors: Sequence[Color],
                         positions: Optional[Sequence[float]] = None,
                         x0: float = 0.0, y0: float = 0.0,
                         x1: float = 1.0, y1: float = 1.0) -> None:
    """Fill a plain rectangle with a directional linear gradient.

    ``x0..y1`` are fractional coordinates (0..1) inside the rectangle that
    describe the gradient axis, mirroring the SVG ``x1/y1/x2/y2`` model.
    """
    canvas.saveState()
    canvas.rect(x, y, w, h, stroke=0, fill=0)
    canvas.clipPath(_rect_path(canvas, x, y, w, h), stroke=0, fill=0)
    gx0 = x + x0 * w
    gy0 = y + (1 - y0) * h
    gx1 = x + x1 * w
    gy1 = y + (1 - y1) * h
    canvas.linearGradient(gx0, gy0, gx1, gy1, list(colors), positions, extend=True)
    canvas.restoreState()


def _rect_path(canvas: Canvas, x: float, y: float, w: float, h: float):
    p = canvas.beginPath()
    p.rect(x, y, w, h)
    return p


# ── Soft radial glow (alpha-stacked circles) ────────────────────────────────

def radial_glow(canvas: Canvas, cx: float, cy: float, radius: float,
                color: str, max_alpha: float = 0.5, steps: int = 26) -> None:
    """Approximate a soft radial glow by stacking translucent circles.

    PDF axial/radial shadings do not honour per-stop alpha, so a soft glow is
    built from concentric filled circles whose opacity fades outward.
    """
    canvas.saveState()
    base = HexColor(color)
    for i in range(steps, 0, -1):
        frac = i / steps
        rr = radius * frac
        # Quadratic falloff toward the edge for a smoother halo.
        alpha = max_alpha * (1.0 - frac) ** 1.6 / steps * 6.0
        if alpha <= 0.002:
            continue
        canvas.setFillColor(Color(base.red, base.green, base.blue,
                                  alpha=min(alpha, max_alpha)))
        canvas.circle(cx, cy, rr, stroke=0, fill=1)
    canvas.restoreState()


# ── Tracked / letter-spaced text ────────────────────────────────────────────

def draw_text(canvas: Canvas, x: float, y: float, text: str, *, font: str,
              size: float, color: Color, align: str = "left",
              tracking: float = 0.0) -> None:
    """Draw a single line of text with optional letter spacing & alignment."""
    text = "" if text is None else str(text)
    canvas.saveState()
    canvas.setFillColor(color)
    width = canvas.stringWidth(text, font, size) + tracking * max(len(text) - 1, 0)
    if align == "center":
        start = x - width / 2.0
    elif align == "right":
        start = x - width
    else:
        start = x
    obj = canvas.beginText(start, y)
    obj.setFont(font, size)
    if tracking:
        obj.setCharSpace(tracking)
    obj.textOut(text)
    canvas.drawText(obj)
    canvas.restoreState()


def text_width(canvas: Canvas, text: str, font: str, size: float,
               tracking: float = 0.0) -> float:
    """Measured width of a tracked string."""
    return canvas.stringWidth(text, font, size) + tracking * max(len(text) - 1, 0)


def truncate(canvas: Canvas, text: str, font: str, size: float,
             max_width: float) -> str:
    """Trim ``text`` with an ellipsis so it fits within ``max_width``."""
    if canvas.stringWidth(text, font, size) <= max_width:
        return text
    ell = "…"
    out = text
    while out and canvas.stringWidth(out + ell, font, size) > max_width:
        out = out[:-1]
    return (out + ell) if out else ell
