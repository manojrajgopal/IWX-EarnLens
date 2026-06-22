"""Reusable cinematic primitives — KPI cards, section headings, share bars."""
from __future__ import annotations

from typing import List, Sequence, Tuple

from reportlab.lib.colors import Color
from reportlab.platypus import Flowable

from .drawing import (draw_text, fill_rounded_rect, gradient_rounded_rect,
                      hex_color, lighten, stroke_rounded_rect, to_color,
                      truncate)
from .layout import SANS, SANS_BOLD, SERIF_BOLD, RenderContext
from .theme import Palette


def draw_pill(canvas, x: float, y: float, w: float, h: float, text: str, *,
              fill: Color, text_color: Color, border: Color = None) -> None:
    """Draw a rounded, letter-spaced status pill centred on its text."""
    fill_rounded_rect(canvas, x, y, w, h, h / 2.0, fill)
    if border is not None:
        stroke_rounded_rect(canvas, x, y, w, h, h / 2.0, border, 1)
    draw_text(canvas, x + w / 2.0, y + h / 2.0 - 3.0, text.upper(), font=SANS_BOLD,
              size=8.5, color=text_color, align="center", tracking=1.0)


class SectionHeading(Flowable):
    """Numbered chapter heading: index plate · eyebrow · title · rule."""

    HEIGHT = 58.0

    def __init__(self, index: str, eyebrow: str, title: str, subtitle: str,
                 ctx: RenderContext) -> None:
        super().__init__()
        self.index = index
        self.eyebrow = eyebrow
        self.title = title
        self.subtitle = subtitle
        self.ctx = ctx

    def wrap(self, avail_w: float, avail_h: float):
        self._w = avail_w if avail_w else self.ctx.content_width
        return self._w, self.HEIGHT + 12.0

    def draw(self) -> None:
        c = self.canv
        pal = self.ctx.palette
        w = self._w
        top = self.HEIGHT + 12.0
        # Index plate (gradient accent → accent2).
        bx, by, bw, bh = 0.0, top - 6 - 44, 40.0, 44.0
        gradient_rounded_rect(c, bx, by, bw, bh, 8,
                              [hex_color(pal.accent2), hex_color(pal.accent)],
                              vertical=True)
        draw_text(c, bx + bw / 2.0, by + bh / 2.0 - 6, self.index, font=SERIF_BOLD,
                  size=17, color=to_color(pal.on_cover), align="center")
        # Eyebrow + title.
        draw_text(c, 54, top - 20, self.eyebrow.upper(), font=SANS_BOLD, size=8.5,
                  color=to_color(pal.accent), tracking=3.0)
        draw_text(c, 53, top - 42, self.title, font=SERIF_BOLD, size=19,
                  color=to_color(pal.ink))
        if self.subtitle:
            draw_text(c, w, top - 20, self.subtitle, font=SANS, size=9,
                      color=to_color(pal.ink_faint), align="right")
        # Gradient rule under the title (fades into the page).
        gradient_rounded_rect(c, 54, top - 51, w - 54, 2, 1,
                              [hex_color(pal.accent), hex_color(pal.paper)])


class KpiRow(Flowable):
    """A responsive row of headline KPI cards."""

    HEIGHT = 96.0
    GAP = 14.0

    def __init__(self, cards: Sequence[Tuple[str, str, str]],
                 ctx: RenderContext) -> None:
        super().__init__()
        self.cards = list(cards)
        self.ctx = ctx

    def wrap(self, avail_w: float, avail_h: float):
        self._w = avail_w if avail_w else self.ctx.content_width
        return self._w, self.HEIGHT + 14.0

    def draw(self) -> None:
        c = self.canv
        pal = self.ctx.palette
        n = max(len(self.cards), 1)
        card_w = (self._w - self.GAP * (n - 1)) / n
        y = 14.0
        for i, (label, value, sub) in enumerate(self.cards):
            x = i * (card_w + self.GAP)
            self._card(c, pal, x, y, card_w, self.HEIGHT, label, value, sub)

    @staticmethod
    def _card(c, pal: Palette, x, y, w, h, label, value, sub) -> None:
        gradient_rounded_rect(c, x, y, w, h, 14,
                              [hex_color(pal.paper),
                               lighten(pal.accent, 0.86)], vertical=True)
        stroke_rounded_rect(c, x, y, w, h, 14, to_color(pal.line), 1)
        # Left accent bar.
        gradient_rounded_rect(c, x + 0, y + 10, 6, h - 20, 3,
                              [lighten(pal.accent, 0.18), hex_color(pal.accent)],
                              vertical=True)
        # Accent dot, top-right.
        c.saveState()
        c.setFillColor(Color(*_rgb(pal.accent), alpha=0.12))
        c.circle(x + w - 22, y + h - 24, 13, stroke=0, fill=1)
        c.setFillColor(to_color(pal.accent))
        c.circle(x + w - 22, y + h - 24, 5, stroke=0, fill=1)
        c.restoreState()
        # Label (clipped so it never runs under the dot).
        label_text = truncate(c, label.upper(), SANS_BOLD, 8.5, w - 60)
        draw_text(c, x + 20, y + h - 30, label_text, font=SANS_BOLD, size=8.5,
                  color=to_color(pal.ink_faint), tracking=2.0)
        # Value (auto-fit to the card width).
        value_size = 23.0
        max_value_w = w - 38
        while value_size > 12 and c.stringWidth(value, SERIF_BOLD, value_size) > max_value_w:
            value_size -= 0.5
        draw_text(c, x + 20, y + 26, value, font=SERIF_BOLD, size=value_size,
                  color=to_color(pal.ink))
        # Sub-label.
        if sub:
            draw_text(c, x + 20, y + 12, sub, font=SANS_BOLD, size=9,
                      color=to_color(pal.accent))


class DistributionBars(Flowable):
    """A ranked stack of share bars (label · track · amount · percent)."""

    ROW_H = 40.0

    def __init__(self, rows: Sequence[Tuple[str, str, str, float, str]],
                 ctx: RenderContext) -> None:
        super().__init__()
        self.rows = list(rows)
        self.ctx = ctx

    def wrap(self, avail_w: float, avail_h: float):
        self._w = avail_w if avail_w else self.ctx.content_width
        return self._w, self.ROW_H * len(self.rows) + 4.0

    def draw(self) -> None:
        c = self.canv
        pal = self.ctx.palette
        w = self._w
        label_w = w * 0.34
        value_w = w * 0.17
        total_rows = len(self.rows)
        for i, (label, amount_label, count_label, pct, color) in enumerate(self.rows):
            cy = (total_rows - 1 - i) * self.ROW_H + self.ROW_H / 2.0
            # Rank dot.
            c.saveState()
            c.setFillColor(to_color(color))
            c.circle(9, cy, 4.5, stroke=0, fill=1)
            c.restoreState()
            # Label lines.
            draw_text(c, 20, cy + 1, truncate(c, label, SANS, 9.5, label_w - 14),
                      font=SANS, size=9.5, color=to_color(pal.ink))
            draw_text(c, 20, cy - 10, count_label, font=SANS, size=7.5,
                      color=to_color(pal.ink_faint))
            # Track + fill.
            track_x = label_w + 8
            track_w = w - label_w - value_w - 16
            fill_rounded_rect(c, track_x, cy - 6, track_w, 12, 6,
                              to_color(pal.panel_alt))
            fw = max(track_w * (pct / 100.0), 3.0)
            gradient_rounded_rect(c, track_x, cy - 6, fw, 12, 6,
                                  [lighten(color, 0.2), hex_color(color)])
            # Value lines.
            draw_text(c, w, cy + 1, amount_label, font=SANS_BOLD, size=9.5,
                      color=to_color(pal.ink), align="right")
            draw_text(c, w, cy - 10, f"{pct:.1f}%", font=SANS_BOLD, size=7.8,
                      color=to_color(color), align="right")


def _rgb(value: str):
    c = hex_color(value)
    return c.red, c.green, c.blue
