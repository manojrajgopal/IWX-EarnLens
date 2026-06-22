"""Page chrome — cinematic backgrounds, header lockup and footers.

These functions paint directly on the canvas and are invoked from the page
templates (backgrounds + header) and the numbered canvas (footer).
"""
from __future__ import annotations

import math
import random

from reportlab.lib.colors import Color

from .drawing import (draw_text, fill_rounded_rect, gradient_rounded_rect,
                      hex_color, linear_gradient_rect, radial_glow,
                      stroke_rounded_rect, to_color)
from .layout import MARGIN_X, SANS, SANS_BOLD, SERIF_BOLD, RenderContext
from .logo import recolored_logo


# ── Backgrounds ──────────────────────────────────────────────────────────────

def draw_cover_background(c, ctx: RenderContext) -> None:
    """Full-bleed cinematic cover backdrop."""
    pal = ctx.palette
    w, h = ctx.page_width, ctx.page_height

    # Diagonal base gradient.
    linear_gradient_rect(c, 0, 0, w, h,
                         [hex_color(pal.cover_from), hex_color(pal.cover_mid),
                          hex_color(pal.cover_to)],
                         positions=[0.0, 0.52, 1.0],
                         x0=0.0, y0=0.0, x1=0.35, y1=1.0)

    # Aurora glows.
    radial_glow(c, 0.78 * w, 0.84 * h, 0.62 * w, pal.cover_glow, max_alpha=0.55)
    radial_glow(c, 0.12 * w, 0.08 * h, 0.55 * w, pal.accent3, max_alpha=0.40)

    # Star field (seeded for deterministic output).
    rnd = random.Random(9173)
    c.saveState()
    base = hex_color(pal.on_cover)
    for _ in range(46):
        sx = rnd.uniform(0, w)
        sy = rnd.uniform(0.45 * h, h)
        sr = rnd.uniform(0.3, 1.6)
        alpha = rnd.uniform(0.15, 0.65)
        c.setFillColor(Color(base.red, base.green, base.blue, alpha=alpha))
        c.circle(sx, sy, sr, stroke=0, fill=1)
    c.restoreState()

    # Layered sine waves toward the lower third.
    glow = hex_color(pal.cover_glow)
    for layer in range(4):
        amp = 18 + layer * 8
        base_y = 0.38 * h - layer * 26
        alpha = max(0.10 - layer * 0.024, 0.026)
        _stroke_wave(c, w, base_y, amp, Color(glow.red, glow.green, glow.blue,
                                              alpha=alpha))

    # Decorative frames.
    on = hex_color(pal.on_cover)
    stroke_rounded_rect(c, 22, 22, w - 44, h - 44, 10,
                        Color(on.red, on.green, on.blue, alpha=0.18), 1)
    stroke_rounded_rect(c, 27, 27, w - 54, h - 54, 8,
                        Color(glow.red, glow.green, glow.blue, alpha=0.22), 0.6)


def draw_content_background(c, ctx: RenderContext) -> None:
    """Subtle paper + glow backdrop for content pages."""
    pal = ctx.palette
    w, h = ctx.page_width, ctx.page_height

    linear_gradient_rect(c, 0, 0, w, h,
                         [hex_color(pal.paper), hex_color(pal.panel)],
                         x0=0.0, y0=0.0, x1=0.0, y1=1.0)

    radial_glow(c, 0.92 * w, 0.94 * h, 0.40 * w, pal.accent_soft, max_alpha=0.55)

    # Gentle wave ripple along the lower third.
    soft = hex_color(pal.accent_soft)
    c.saveState()
    c.setFillColor(Color(soft.red, soft.green, soft.blue, alpha=0.35))
    p = c.beginPath()
    base_y = h * 0.16
    p.moveTo(0, 0)
    p.lineTo(0, base_y)
    steps = 6
    for i in range(steps + 1):
        x = w * i / steps
        y = base_y + math.sin(i / steps * math.pi * 2) * 14
        p.lineTo(x, y)
    p.lineTo(w, 0)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.restoreState()

    # Side rails.
    c.saveState()
    accent = hex_color(pal.accent)
    accent2 = hex_color(pal.accent2)
    c.setFillColor(Color(accent.red, accent.green, accent.blue, alpha=0.90))
    c.rect(0, 0, 5, h, stroke=0, fill=1)
    c.setFillColor(Color(accent2.red, accent2.green, accent2.blue, alpha=0.55))
    c.rect(5, 0, 2, h, stroke=0, fill=1)
    c.restoreState()


def _stroke_wave(c, w: float, base_y: float, amp: float, color: Color) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(3.0)
    p = c.beginPath()
    steps = 60
    p.moveTo(0, base_y)
    for i in range(1, steps + 1):
        x = w * i / steps
        y = base_y + math.sin(i / steps * math.pi * 4) * amp
        p.lineTo(x, y)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


# ── Header & footers ─────────────────────────────────────────────────────────

def draw_header(c, ctx: RenderContext, range_label: str, edition: str) -> None:
    """Brand lockup + coverage labels at the top of content pages."""
    pal = ctx.palette
    w, h = ctx.page_width, ctx.page_height
    inner_w = w - 2 * MARGIN_X
    top = h - 52

    logo = recolored_logo(pal.ink)
    text_x = MARGIN_X
    if logo is not None:
        size = 30
        c.saveState()
        c.drawImage(logo, MARGIN_X, top - size + 4, width=size, height=size,
                    preserveAspectRatio=True, mask="auto")
        c.restoreState()
        text_x = MARGIN_X + size + 8
    else:
        gradient_rounded_rect(c, MARGIN_X, top - 26, 30, 30, 8,
                              [hex_color(pal.accent), hex_color(pal.accent2)],
                              vertical=True)
        draw_text(c, MARGIN_X + 15, top - 18, "IWX", font=SERIF_BOLD, size=12,
                  color=to_color(pal.on_cover), align="center")
        text_x = MARGIN_X + 38

    draw_text(c, text_x, top - 9, "EarnLens", font=SERIF_BOLD, size=13,
              color=to_color(pal.ink))
    draw_text(c, text_x, top - 21, "INCOME INTELLIGENCE", font=SANS, size=7.5,
              color=to_color(pal.ink_faint), tracking=1.6)

    right = MARGIN_X + inner_w
    draw_text(c, right, top - 9, range_label, font=SANS_BOLD, size=8.5,
              color=to_color(pal.ink_soft), align="right")
    draw_text(c, right, top - 21, edition, font=SANS, size=7.5,
              color=to_color(pal.ink_faint), align="right")

    c.saveState()
    c.setStrokeColor(to_color(pal.line))
    c.setLineWidth(1)
    c.line(MARGIN_X, top - 34, right, top - 34)
    c.restoreState()


def draw_content_footer(c, ctx: RenderContext, generated_label: str,
                        page_num: int, page_count: int) -> None:
    """Three-part footer: issued · brand · page counter (+ gradient rule)."""
    pal = ctx.palette
    w = ctx.page_width
    inner_w = w - 2 * MARGIN_X
    right = MARGIN_X + inner_w

    gradient_rounded_rect(c, MARGIN_X, 58, inner_w, 1, 0.5,
                          [hex_color(pal.paper), hex_color(pal.accent),
                           hex_color(pal.paper)], positions=[0.0, 0.5, 1.0])

    draw_text(c, MARGIN_X, 44, f"Issued {generated_label}", font=SANS, size=8,
              color=to_color(pal.ink_faint))
    draw_text(c, MARGIN_X + inner_w / 2.0, 44, "IWX · EARNLENS", font=SERIF_BOLD,
              size=9, color=to_color(pal.ink_soft), align="center", tracking=2.0)
    draw_text(c, right, 44, f"Page {page_num} of {page_count}", font=SANS_BOLD,
              size=8.5, color=to_color(pal.ink_soft), align="right")


def draw_cover_footer(c, ctx: RenderContext) -> None:
    """Centred tagline along the bottom of the cover."""
    pal = ctx.palette
    draw_text(c, ctx.page_width / 2.0, 36, "SHAPING DREAMS WITH TIMELESS WAVES",
              font=SANS, size=8.5, color=to_color(pal.on_cover_soft),
              align="center", tracking=3.0)
