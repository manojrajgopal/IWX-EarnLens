"""Detailed ledger table flowables."""
from __future__ import annotations

from typing import List, Sequence

from reportlab.lib.colors import Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Flowable, Paragraph, Table, TableStyle

from .drawing import hex_color, to_color
from .formatting import format_medium_date, format_money, humanize
from .layout import SANS, SANS_BOLD, RenderContext


def _para(text: str, font: str, size: float, color, leading: float = None):
    style = ParagraphStyle("cell", fontName=font, fontSize=size,
                           leading=leading or size + 1.5, textColor=color)
    return Paragraph(text or "—", style)


def build_ledger(rows: Sequence[dict], ctx: RenderContext, limit: int) -> List[Flowable]:
    """Return the ledger table plus an optional 'hidden rows' note."""
    pal = ctx.palette
    pad = ctx.row_padding

    shown = list(rows)
    hidden = 0
    if limit and limit > 0 and len(shown) > limit:
        hidden = len(shown) - limit
        shown = shown[:limit]

    header = ["#", "TITLE", "TYPE", "CATEGORY", "SOURCE", "DATE", "AMOUNT"]
    data: List[list] = [header]

    ink = to_color(pal.ink)
    ink_soft = to_color(pal.ink_soft)
    ink_faint = to_color(pal.ink_faint)

    shown_total = 0.0
    for i, row in enumerate(shown, start=1):
        amount = float(row.get("amount", 0) or 0)
        shown_total += amount
        currency = row.get("currency") or ctx.currency
        data.append([
            _para(str(i), SANS, 8, ink_faint),
            _para(row.get("title") or "—", SANS_BOLD, 8.5, ink),
            _para(humanize(row.get("income_type", "")), SANS, 8, ink_soft),
            _para(row.get("category") or "—", SANS, 8, ink_soft),
            _para(row.get("source_name") or "—", SANS, 8, ink_soft),
            _para(format_medium_date(row.get("payment_date")), SANS, 8, ink_soft),
            _para(format_money(amount, currency), SANS_BOLD, 8.5, ink),
        ])

    # Totals row spanning the descriptive columns.
    total_currency = ctx.currency
    data.append([
        "", _para("TOTAL (shown)", SANS_BOLD, 8, ink_faint), "", "", "", "",
        _para(format_money(shown_total, total_currency), SANS_BOLD, 9.5,
              to_color(pal.accent)),
    ])

    title_w = ctx.content_width - (22 + 54 + 58 + 58 + 60 + 66)
    col_widths = [22, title_w, 54, 58, 58, 60, 66]

    table = Table(data, colWidths=col_widths, repeatRows=1)
    last = len(data) - 1
    zebra = []
    for r in range(1, last):
        if r % 2 == 0:
            zebra.append(("BACKGROUND", (0, r), (-1, r), to_color(pal.panel)))

    style = [
        ("BACKGROUND", (0, 0), (-1, 0), to_color(pal.ink)),
        ("TEXTCOLOR", (0, 0), (-1, 0), to_color(pal.on_cover)),
        ("FONTNAME", (0, 0), (-1, 0), SANS_BOLD),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 1), (-1, last - 1), 0.6, to_color(pal.line)),
        ("SPAN", (1, last), (5, last)),
        ("LINEABOVE", (0, last), (-1, last), 1, to_color(pal.line)),
        ("TOPPADDING", (0, last), (-1, last), 8),
    ] + zebra

    table.setStyle(TableStyle(style))
    flowables: List[Flowable] = [table]

    if hidden > 0:
        note = (f"+ {hidden} more entries not shown "
                f"(raise the ledger limit to include them).")
        flowables.append(
            _para(note, "Helvetica-Oblique", 8.5, ink_faint))
    return flowables
