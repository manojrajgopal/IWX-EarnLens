"""Chart flowables — cinematic donut and momentum bar chart."""
from __future__ import annotations

import math
from typing import List, Sequence, Tuple

from reportlab.platypus import Flowable

from .drawing import (draw_text, fill_rounded_rect, gradient_rounded_rect,
                      hex_color, lighten, stroke_rounded_rect, to_color,
                      truncate)
from .formatting import format_money_compact
from .layout import SANS, SANS_BOLD, SERIF_BOLD
from .theme import Palette


class DonutChart(Flowable):
    """A ring chart with a centred headline value."""

    def __init__(self, slices: Sequence[Tuple[str, float, str]], center_top: str,
                 center_value: str, palette: Palette, size: float = 150.0) -> None:
        super().__init__()
        self.slices = [(lbl, max(val, 0.0), col) for lbl, val, col in slices]
        self.center_top = center_top
        self.center_value = center_value
        self.palette = palette
        self.size = size

    def wrap(self, avail_w: float, avail_h: float):
        return self.size, self.size

    def draw(self) -> None:
        c = self.canv
        pal = self.palette
        size = self.size
        cx = cy = size / 2.0
        radius = size / 2.0 - 8.0
        stroke = size * 0.13
        hole = radius - stroke

        total = sum(v for _, v, _ in self.slices) or 1.0

        # Base ring (covers gaps / zero-state).
        c.saveState()
        c.setFillColor(to_color(pal.panel_alt))
        c.circle(cx, cy, radius, stroke=0, fill=1)
        c.restoreState()

        # Coloured wedges, clockwise from 12 o'clock.
        start = 90.0
        bbox = (cx - radius, cy - radius, cx + radius, cy + radius)
        for _, value, color in self.slices:
            if value <= 0:
                continue
            extent = -(value / total) * 360.0
            c.saveState()
            c.setFillColor(to_color(color))
            c.wedge(bbox[0], bbox[1], bbox[2], bbox[3], start, extent,
                    stroke=0, fill=1)
            c.restoreState()
            start += extent

        # Punch the hole to leave a ring.
        c.saveState()
        c.setFillColor(to_color(pal.paper))
        c.circle(cx, cy, hole, stroke=0, fill=1)
        c.restoreState()

        # Centre labels.
        draw_text(c, cx, cy + 2, self.center_top, font=SANS, size=7,
                  color=to_color(pal.ink_faint), align="center", tracking=1.5)
        draw_text(c, cx, cy - 14, self.center_value, font=SERIF_BOLD, size=14,
                  color=to_color(pal.ink), align="center")


class BarChart(Flowable):
    """Momentum column chart with gridlines and per-bar value labels."""

    def __init__(self, points: Sequence[Tuple[str, float]], currency: str,
                 palette: Palette, series: List[str], width: float,
                 height: float = 210.0) -> None:
        super().__init__()
        self.points = list(points)
        self.currency = currency
        self.palette = palette
        self.series = series
        self.width = width
        self.height = height

    def wrap(self, avail_w: float, avail_h: float):
        return self.width, self.height

    def draw(self) -> None:
        c = self.canv
        pal = self.palette
        w, h = self.width, self.height

        # Frame.
        fill_rounded_rect(c, 0, 0, w, h, 12, to_color(pal.paper))
        stroke_rounded_rect(c, 0, 0, w, h, 12, to_color(pal.line), 1)

        pad_l, pad_r, pad_t, pad_b = 40.0, 14.0, 16.0, 30.0
        plot_w = w - pad_l - pad_r
        plot_h = h - pad_t - pad_b
        base_y = pad_b
        max_val = max((v for _, v in self.points), default=0.0) or 1.0

        # Gridlines + axis labels.
        c.saveState()
        for i in range(5):
            frac = i / 4.0
            gy = base_y + plot_h * frac
            c.setStrokeColor(to_color(pal.line))
            c.setLineWidth(0.7)
            c.setDash(2, 3)
            c.line(pad_l, gy, pad_l + plot_w, gy)
            label = format_money_compact(max_val * frac, self.currency)
            draw_text(c, pad_l - 4, gy - 2.2, label, font=SANS, size=6.5,
                      color=to_color(pal.ink_faint), align="right")
        c.restoreState()

        # Baseline.
        c.saveState()
        c.setStrokeColor(to_color(pal.ink_faint))
        c.setLineWidth(1)
        c.line(pad_l, base_y, pad_l + plot_w, base_y)
        c.restoreState()

        n = len(self.points)
        if n == 0:
            return
        slot = plot_w / n
        bar_w = min(34.0, slot * 0.56)
        show_values = n <= 14

        for i, (label, value) in enumerate(self.points):
            color = self.series[i % len(self.series)]
            bar_h = (value / max_val) * plot_h if max_val else 0.0
            bar_h = max(bar_h, 1.0)
            bx = pad_l + slot * i + (slot - bar_w) / 2.0
            gradient_rounded_rect(
                c, bx, base_y, bar_w, bar_h, 3,
                [lighten(color, 0.35), hex_color(color)], vertical=True)

            short = truncate(c, label, SANS, 6.8, slot - 2)
            draw_text(c, bx + bar_w / 2.0, base_y - 12, short, font=SANS,
                      size=6.8, color=to_color(pal.ink_soft), align="center")

            if show_values and value > 0:
                vlabel = format_money_compact(value, self.currency)
                draw_text(c, bx + bar_w / 2.0, base_y + bar_h + 3, vlabel,
                          font=SANS_BOLD, size=6.4,
                          color=to_color(pal.ink), align="center")
