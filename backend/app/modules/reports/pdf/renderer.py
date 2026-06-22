"""Top-level cinematic report renderer — assembles the full PDF document."""
from __future__ import annotations

import io
from typing import Any, List, Sequence

from reportlab.pdfgen import canvas as _canvas
from reportlab.platypus import (BaseDocTemplate, Frame, PageBreak, PageTemplate,
                                Spacer)

from .charts import BarChart
from .chrome import (draw_content_background, draw_content_footer, draw_cover_background,
                     draw_cover_footer, draw_header)
from .components import (BreakdownBlock, DistributionBars, InsightPanel, KpiRow,
                         SectionHeading)
from .cover import draw_cover
from .formatting import (format_int, format_money, format_range_label, humanize)
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

def _content_height(ctx: RenderContext) -> float:
    """Usable vertical space inside the content frame."""
    return ctx.page_height - MARGIN_TOP - MARGIN_BOTTOM


def _build_sections(report: Any, options: ReportExportRequest,
                    ctx: RenderContext, meta: dict) -> List[List[Any]]:
    sec = options.sections
    out: List[List[Any]] = []
    idx = 1

    if sec.summary or sec.trend:
        out.append(_overview_section(idx, report, ctx, meta,
                                     sec.summary, sec.trend))
        idx += 1
    if sec.categories or sec.types:
        out.append(_distribution_section(idx, report, ctx, meta,
                                         sec.categories, sec.types))
        idx += 1
    if sec.ledger:
        out.append(_ledger_section(idx, report, options, ctx, meta))
        idx += 1
    return out


def _overview_section(idx: int, report: Any, ctx: RenderContext, meta: dict,
                      want_summary: bool, want_trend: bool) -> List[Any]:
    """Headline KPIs paired with the momentum chart — one full page."""
    t = report.totals
    cur = ctx.currency
    avail = _content_height(ctx)
    heading_h = SectionHeading.HEIGHT + 12.0
    body_h = avail - heading_h

    flow: List[Any] = [
        SectionHeading(f"{idx:02d}", "Executive summary", "Headline metrics",
                       meta["range_label"], ctx),
    ]

    used = 0.0
    if want_summary:
        cards = [
            ("Total", format_money(t.total, cur), f"{format_int(t.count)} entries"),
            ("Entries", format_int(t.count), "logged"),
            ("Average", format_money(t.average, cur), "per entry"),
            ("Peak", format_money(t.maximum, cur), "largest single"),
        ]
        floor_ceiling = [
            ("Lowest entry", format_money(t.minimum, cur), "floor"),
            ("Median band", format_money((t.minimum + t.maximum) / 2.0, cur),
             "mid-point"),
            ("Highest entry", format_money(t.maximum, cur), "ceiling"),
        ]
        row_h = KpiRow.HEIGHT + 14.0
        flow += [KpiRow(cards, ctx), Spacer(1, 4), KpiRow(floor_ceiling, ctx)]
        used += row_h * 2 + 4

    gap = 14.0
    remaining = body_h - used - (gap if used else 0)

    if want_trend:
        points = [(p.label, p.total) for p in report.trend]
        chart_h = max(remaining, 200.0)
        if used:
            flow.append(Spacer(1, gap))
        flow.append(BarChart(points, ctx.currency, ctx.palette,
                             ctx.palette.series, ctx.content_width,
                             height=chart_h))
    elif want_summary:
        rows = _insight_rows(report, ctx)
        if rows:
            flow.append(Spacer(1, gap))
            flow.append(InsightPanel("At a glance", rows, ctx,
                                     max(remaining, 160.0)))
    return flow


def _insight_rows(report: Any, ctx: RenderContext):
    """Build callout rows for the 'at a glance' panel."""
    cur = ctx.currency
    pal = ctx.palette
    rows: List[tuple] = []

    cats = sorted(getattr(report, "by_category", []) or [],
                  key=lambda d: d.total, reverse=True)
    if cats:
        c0 = cats[0]
        rows.append(("Top category", format_money(c0.total, cur),
                     f"{c0.label} · {format_int(c0.count)} entries",
                     c0.percentage, c0.color or series_color(pal, 0)))

    types = sorted(getattr(report, "by_type", []) or [],
                   key=lambda d: d.total, reverse=True)
    if types:
        y0 = types[0]
        rows.append(("Leading type", format_money(y0.total, cur),
                     f"{humanize(y0.label)} · {format_int(y0.count)} entries",
                     y0.percentage, y0.color or series_color(pal, 2)))

    trend = list(getattr(report, "trend", []) or [])
    grand = report.totals.total or 1.0
    active = [p for p in trend if p.total > 0]
    if active:
        peak = max(active, key=lambda p: p.total)
        rows.append(("Peak period", format_money(peak.total, cur), peak.label,
                     peak.total / grand * 100.0, series_color(pal, 1)))
        if len(active) > 1:
            quiet = min(active, key=lambda p: p.total)
            rows.append(("Quietest active period", format_money(quiet.total, cur),
                         quiet.label, quiet.total / grand * 100.0,
                         series_color(pal, 3)))

    t = report.totals
    rows.append(("Average per entry", format_money(t.average, cur),
                 f"across {format_int(t.count)} entries", 0.0,
                 series_color(pal, 4)))
    return rows[:6]


def _prepare_distribution(items: Sequence[Any], ctx: RenderContext,
                          max_slices: int = _MAX_SLICES):
    """Top-N slices + 'Other', with resolved colours."""
    ordered = sorted(items, key=lambda d: d.total, reverse=True)
    slices, bars = [], []
    head = ordered[:max_slices]
    tail = ordered[max_slices:]
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


def _distribution_section(idx: int, report: Any, ctx: RenderContext, meta: dict,
                          want_categories: bool, want_types: bool) -> List[Any]:
    """Category and type breakdowns grouped onto a single, full page."""
    heading = SectionHeading(f"{idx:02d}", "Distribution",
                             "Where your income comes from",
                             meta["range_label"], ctx)

    blocks: List[tuple] = []
    if want_categories:
        blocks.append(("Category breakdown", getattr(report, "by_category", [])))
    if want_types:
        blocks.append(("Type composition", getattr(report, "by_type", [])))

    avail = _content_height(ctx) - (SectionHeading.HEIGHT + 12.0)
    gap = 14.0
    n = max(len(blocks), 1)
    block_h = (avail - gap * (n - 1)) / n
    # Fewer slices when two blocks share the page so rows stay legible.
    max_slices = 5 if n > 1 else _MAX_SLICES

    flow: List[Any] = [heading]
    for i, (eyebrow, items) in enumerate(blocks):
        if i > 0:
            flow.append(Spacer(1, gap))
        if not items:
            from .ledger import _para
            from .drawing import to_color
            from .layout import SANS_OBLIQUE
            flow.append(_para(
                "No data available for this section in the selected range.",
                SANS_OBLIQUE, 10, to_color(ctx.palette.ink_faint)))
            continue
        slices, bars, total = _prepare_distribution(items, ctx, max_slices)
        flow.append(BreakdownBlock(eyebrow, slices, bars, "TOTAL",
                                   format_money(total, ctx.currency),
                                   ctx, block_h))
    return flow


def _ledger_section(idx: int, report: Any, options: ReportExportRequest,
                    ctx: RenderContext, meta: dict) -> List[Any]:
    rows = [_row_dict(r) for r in report.rows]
    heading = SectionHeading(f"{idx:02d}", "Detailed ledger",
                             f"{format_int(len(rows))} entries",
                             meta["range_label"], ctx)
    flow: List[Any] = [heading, Spacer(1, 6)]
    flow += build_ledger(rows, ctx, options.ledger_limit)

    # Closing recap band so the page reads as a finished statement.
    limit = options.ledger_limit
    if limit and limit > 0 and len(rows) > limit:
        shown = rows[:limit]
    else:
        shown = rows
    hidden = len(rows) - len(shown)
    shown_total = sum(float(r.get("amount", 0) or 0) for r in shown)
    avg = shown_total / len(shown) if shown else 0.0
    cur = ctx.currency
    recap = [
        ("Shown", format_money(shown_total, cur),
         f"{format_int(len(shown))} entries"),
        ("Average", format_money(avg, cur), "per shown entry"),
        ("Entries", format_int(len(rows)), "in range"),
        ("Hidden", format_int(hidden), "not shown" if hidden else "all shown"),
    ]
    flow += [Spacer(1, 16), KpiRow(recap, ctx)]
    return flow


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
