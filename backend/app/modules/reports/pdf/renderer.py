"""Top-level cinematic report renderer — assembles the full PDF document."""
from __future__ import annotations

import io
from typing import Any, List, Sequence

from reportlab.pdfgen import canvas as _canvas
from reportlab.platypus import (BaseDocTemplate, Frame, PageBreak, PageTemplate,
                                Spacer, Table, TableStyle)

from .charts import BarChart, DonutChart
from .chrome import (draw_content_background, draw_content_footer, draw_cover_background,
                     draw_cover_footer, draw_header)
from .components import DistributionBars, KpiRow, SectionHeading
from .cover import draw_cover
from .formatting import (format_int, format_money, format_range_label)
from .layout import (MARGIN_BOTTOM, MARGIN_TOP, MARGIN_X, RenderContext,
                     page_size)
from .ledger import build_ledger
from .schemas import ReportExportRequest
from .theme import resolve_palette, series_color

_MAX_SLICES = 8


def render_report_pdf(report: Any, options: ReportExportRequest,
                      currency: str) -> bytes:
    """Build the cinematic PDF and return the raw bytes."""
    pal = resolve_palette(options.theme_id)
    page_w, page_h = page_size(options.page_size)
    ctx = RenderContext(palette=pal, currency=currency, theme_id=options.theme_id,
                        density=options.density, page_width=page_w,
                        page_height=page_h)

    meta = _build_meta(report, options, ctx)

    buffer = io.BytesIO()
    doc = BaseDocTemplate(
        buffer, pagesize=(page_w, page_h),
        leftMargin=MARGIN_X, rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
        title=options.title, author="IWX EarnLens",
    )

    cover_frame = Frame(0, 0, page_w, page_h, id="cover",
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    content_frame = Frame(MARGIN_X, MARGIN_BOTTOM, ctx.content_width,
                          page_h - MARGIN_TOP - MARGIN_BOTTOM, id="content",
                          leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

    range_label = meta["range_label"]
    edition = f"{pal.name} Edition"

    def on_cover(c, _doc):
        draw_cover_background(c, ctx)
        draw_cover(c, ctx, options, meta)
        draw_cover_footer(c, ctx)

    def on_content(c, _doc):
        draw_content_background(c, ctx)
        draw_header(c, ctx, range_label, edition)

    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame], onPage=on_cover),
        PageTemplate(id="content", frames=[content_frame], onPage=on_content),
    ])

    story: List[Any] = [Spacer(1, 1)]
    sections = _build_sections(report, options, ctx, meta)
    if sections:
        story += [_next("content"), PageBreak()]
        for i, flowables in enumerate(sections):
            if i > 0:
                story.append(PageBreak())
            story += flowables
    else:
        story += [_next("content"), PageBreak(), Spacer(1, 1)]

    doc.build(story, canvasmaker=_numbered_canvas(ctx, meta))
    return buffer.getvalue()


def _next(template_id: str):
    from reportlab.platypus import NextPageTemplate
    return NextPageTemplate(template_id)


# ── Meta ─────────────────────────────────────────────────────────────────────

def _build_meta(report: Any, options: ReportExportRequest, ctx: RenderContext) -> dict:
    from .formatting import format_date_time
    totals = report.totals
    return {
        "range_label": format_range_label(options.start_date, options.end_date),
        "generated_label": format_date_time(report.generated_at),
        "total_label": format_money(totals.total, ctx.currency),
        "count": format_int(totals.count),
    }


# ── Sections ─────────────────────────────────────────────────────────────────

def _build_sections(report: Any, options: ReportExportRequest,
                    ctx: RenderContext, meta: dict) -> List[List[Any]]:
    sec = options.sections
    out: List[List[Any]] = []
    idx = 1

    if sec.summary:
        out.append(_summary_section(idx, report, ctx, meta))
        idx += 1
    if sec.categories:
        out.append(_breakdown_section(idx, "Distribution", "Category breakdown",
                                      meta["range_label"], report.by_category, ctx))
        idx += 1
    if sec.types:
        out.append(_breakdown_section(idx, "Composition", "Type composition",
                                      meta["range_label"], report.by_type, ctx))
        idx += 1
    if sec.trend:
        out.append(_trend_section(idx, report, ctx, meta))
        idx += 1
    if sec.ledger:
        out.append(_ledger_section(idx, report, options, ctx, meta))
        idx += 1
    return out


def _summary_section(idx: int, report: Any, ctx: RenderContext,
                     meta: dict) -> List[Any]:
    t = report.totals
    cur = ctx.currency
    cards = [
        ("Total", format_money(t.total, cur), f"{format_int(t.count)} entries"),
        ("Entries", format_int(t.count), "logged"),
        ("Average", format_money(t.average, cur), "per entry"),
        ("Peak", format_money(t.maximum, cur), "largest single"),
    ]
    floor_ceiling = [
        ("Lowest entry", format_money(t.minimum, cur), "floor"),
        ("Highest entry", format_money(t.maximum, cur), "ceiling"),
    ]
    return [
        SectionHeading(f"{idx:02d}", "Executive summary", "Headline metrics",
                       meta["range_label"], ctx),
        KpiRow(cards, ctx),
        Spacer(1, 6),
        KpiRow(floor_ceiling, ctx),
    ]


def _prepare_distribution(items: Sequence[Any], ctx: RenderContext):
    """Top-N slices + 'Other', with resolved colours."""
    ordered = sorted(items, key=lambda d: d.total, reverse=True)
    slices, bars = [], []
    head = ordered[:_MAX_SLICES]
    tail = ordered[_MAX_SLICES:]
    for i, item in enumerate(head):
        color = item.color or series_color(ctx.palette, i)
        slices.append((item.label, item.total, color))
        bars.append((item.label, format_money(item.total, ctx.currency),
                     f"{format_int(item.count)} entries", item.percentage, color))
    if tail:
        other_total = sum(d.total for d in tail)
        other_count = sum(d.count for d in tail)
        other_pct = sum(d.percentage for d in tail)
        color = series_color(ctx.palette, len(head))
        slices.append(("Other", other_total, color))
        bars.append(("Other", format_money(other_total, ctx.currency),
                     f"{format_int(other_count)} entries", other_pct, color))
    total = sum(d.total for d in ordered)
    return slices, bars, total


def _breakdown_section(idx: int, eyebrow: str, title: str, subtitle: str,
                       items: Sequence[Any], ctx: RenderContext) -> List[Any]:
    heading = SectionHeading(f"{idx:02d}", eyebrow, title, subtitle, ctx)
    if not items:
        from .ledger import _para
        from .drawing import to_color
        empty = _para("No data available for this section in the selected range.",
                      "Helvetica-Oblique", 10, to_color(ctx.palette.ink_faint))
        return [heading, Spacer(1, 8), empty]

    slices, bars, total = _prepare_distribution(items, ctx)
    donut = DonutChart(slices, "TOTAL", format_money(total, ctx.currency),
                       ctx.palette, size=180)
    bar_stack = DistributionBars(bars, ctx)

    donut_w = 196.0
    grid = Table([[donut, bar_stack]],
                 colWidths=[donut_w, ctx.content_width - donut_w])
    grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return [heading, Spacer(1, 6), grid]


def _trend_section(idx: int, report: Any, ctx: RenderContext,
                   meta: dict) -> List[Any]:
    points = [(p.label, p.total) for p in report.trend]
    chart = BarChart(points, ctx.currency, ctx.palette, ctx.palette.series,
                     ctx.content_width, height=230)
    return [
        SectionHeading(f"{idx:02d}", "Momentum", "Income over time",
                       meta["range_label"], ctx),
        Spacer(1, 6),
        chart,
    ]


def _ledger_section(idx: int, report: Any, options: ReportExportRequest,
                    ctx: RenderContext, meta: dict) -> List[Any]:
    rows = [_row_dict(r) for r in report.rows]
    heading = SectionHeading(f"{idx:02d}", "Detailed ledger",
                             f"{format_int(len(rows))} entries",
                             meta["range_label"], ctx)
    return [heading, Spacer(1, 6)] + build_ledger(rows, ctx, options.ledger_limit)


def _row_dict(row: Any) -> dict:
    return {
        "title": row.title,
        "amount": row.amount,
        "currency": row.currency,
        "income_type": row.income_type,
        "category": row.category,
        "source_name": row.source_name,
        "payment_date": row.payment_date,
    }


# ── Numbered canvas (footer page counter) ────────────────────────────────────

def _numbered_canvas(ctx: RenderContext, meta: dict):
    class NumberedCanvas(_canvas.Canvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._saved_states: List[dict] = []

        def showPage(self):
            self._saved_states.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            total = len(self._saved_states)
            for i, state in enumerate(self._saved_states):
                self.__dict__.update(state)
                if i > 0:  # skip the cover page
                    draw_content_footer(self, ctx, meta["generated_label"],
                                        i + 1, total)
                super().showPage()
            super().save()

    return NumberedCanvas
