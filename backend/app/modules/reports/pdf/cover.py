"""Cinematic cover page — drawn directly on the canvas."""
from __future__ import annotations

from reportlab.lib.colors import Color

from .components import draw_pill
from .drawing import (draw_text, fill_rounded_rect, hex_color, radial_glow,
                      stroke_rounded_rect, to_color)
from .layout import (MARGIN_X, SANS, SANS_BOLD, SANS_OBLIQUE, SERIF_BOLD,
                     SERIF_ITALIC, RenderContext)
from .logo import tinted_logo
from .schemas import ReportExportRequest


def draw_cover(c, ctx: RenderContext, options: ReportExportRequest,
               meta: dict) -> None:
    """Render every cover element over the (already drawn) backdrop."""
    pal = ctx.palette
    w, h = ctx.page_width, ctx.page_height
    cx = w / 2.0
    on = to_color(pal.on_cover)
    on_soft = to_color(pal.on_cover_soft)

    t = 96.0  # distance from the top edge

    # 1 · Luminous seal.
    if options.include_logo:
        seal = tinted_logo(pal.on_cover)
        seal_d = 128.0
        seal_cy = h - t - seal_d / 2.0
        radial_glow(c, cx, seal_cy, 92, pal.cover_glow, max_alpha=0.45)
        if seal is not None:
            c.drawImage(seal, cx - seal_d / 2.0, seal_cy - seal_d / 2.0,
                        width=seal_d, height=seal_d,
                        preserveAspectRatio=True, mask="auto")
        t += seal_d + 22
    else:
        t += 8

    # 2 · Edition pill.
    pill_w = 200.0
    glow = hex_color(pal.cover_glow)
    draw_pill(c, cx - pill_w / 2.0, h - t - 22, pill_w, 22,
              f"{pal.name} Edition",
              fill=Color(on.red, on.green, on.blue, alpha=0.12),
              text_color=on,
              border=Color(glow.red, glow.green, glow.blue, alpha=0.6))
    t += 22 + 20

    # 3 · Title.
    draw_text(c, cx, h - t - 26, options.title, font=SERIF_BOLD, size=32,
              color=on, align="center", tracking=0.5)
    t += 40

    # 4 · Subtitle.
    draw_text(c, cx, h - t - 12, options.subtitle, font=SERIF_ITALIC, size=12,
              color=on_soft, align="center")
    t += 28

    # 5 · Glow divider.
    div_w = ctx.content_width * 0.7
    c.saveState()
    c.setLineWidth(1)
    c.setStrokeColor(Color(glow.red, glow.green, glow.blue, alpha=0.65))
    dy = h - t
    c.line(cx - div_w / 2.0, dy, cx + div_w / 2.0, dy)
    c.setFillColor(to_color(pal.cover_glow))
    c.circle(cx, dy, 2.4, stroke=0, fill=1)
    c.restoreState()
    t += 26

    # 6 · Headline total.
    draw_text(c, cx, h - t, "TOTAL INCOME CAPTURED", font=SANS, size=8.5,
              color=on_soft, align="center", tracking=3.0)
    t += 22
    draw_text(c, cx, h - t, meta["total_label"], font=SERIF_BOLD, size=30,
              color=on, align="center")
    t += 24
    draw_text(c, cx, h - t, f"{meta['count']} entries · {meta['range_label']}",
              font=SANS, size=9.5, color=on_soft, align="center")
    t += 30

    # 7 · Meta plate (Prepared for · Coverage · Issued).
    plate_h = 64.0
    plate_y = h - t - plate_h
    _meta_plate(c, ctx, MARGIN_X, plate_y, ctx.content_width, plate_h, options, meta)
    t += plate_h + 16

    # 8 · Optional cover note.
    note = (options.cover_note or "").strip()
    if options.include_cover_note and note:
        _cover_note(c, ctx, MARGIN_X, h - t, ctx.content_width, note)


def _meta_plate(c, ctx: RenderContext, x, y, w, h, options, meta) -> None:
    pal = ctx.palette
    on = hex_color(pal.on_cover)
    fill_rounded_rect(c, x, y, w, h, 12, Color(on.red, on.green, on.blue, alpha=0.06))
    stroke_rounded_rect(c, x, y, w, h, 12,
                        Color(on.red, on.green, on.blue, alpha=0.18), 1)
    col = w / 3.0
    c.saveState()
    c.setStrokeColor(Color(on.red, on.green, on.blue, alpha=0.16))
    c.setLineWidth(1)
    c.line(x + col, y + 14, x + col, y + h - 14)
    c.line(x + 2 * col, y + 14, x + 2 * col, y + h - 14)
    c.restoreState()

    cells = [
        ("PREPARED FOR", options.prepared_for or "—"),
        ("COVERAGE", meta["range_label"]),
        ("ISSUED", meta["generated_label"]),
    ]
    on_soft = to_color(pal.on_cover_soft)
    for i, (label, value) in enumerate(cells):
        ccx = x + col * i + col / 2.0
        draw_text(c, ccx, y + h - 24, label, font=SANS, size=7.5,
                  color=on_soft, align="center", tracking=2.0)
        from .drawing import truncate
        value = truncate(c, value, SERIF_BOLD, 11.5, col - 16)
        draw_text(c, ccx, y + 18, value, font=SERIF_BOLD, size=11.5,
                  color=to_color(pal.on_cover), align="center")


def _cover_note(c, ctx: RenderContext, x, top_y, w, note: str) -> None:
    pal = ctx.palette
    on = hex_color(pal.on_cover)
    # Wrap the note to the available width.
    words = note.split()
    lines, current = [], ""
    max_w = w - 28
    for word in words:
        trial = (current + " " + word).strip()
        if c.stringWidth(trial, SANS_OBLIQUE, 10) <= max_w:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    lines = lines[:4]
    h = 30 + len(lines) * 13
    y = top_y - h
    fill_rounded_rect(c, x, y, w, h, 10, Color(on.red, on.green, on.blue, alpha=0.05))
    draw_text(c, x + 14, y + h - 16, "A NOTE", font=SANS, size=7.5,
              color=to_color(pal.cover_glow), tracking=2.5)
    for i, line in enumerate(lines):
        draw_text(c, x + 14, y + h - 30 - i * 13, line, font=SANS_OBLIQUE, size=10,
                  color=to_color(pal.on_cover_soft))
