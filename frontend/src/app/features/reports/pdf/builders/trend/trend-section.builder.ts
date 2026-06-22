import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { contentWidth } from '../../config/pdf-page.config';
import { sectionHeading } from '../../primitives/section-heading/section-heading.primitive';
import { barChart } from '../../primitives/bar-chart/bar-chart.primitive';
import { formatMoney } from '../../utils/format/money.format';

/**
 * ─────────────────────────────────────────────────────────────
 *  Momentum trend builder — vector column chart + read-out
 * ─────────────────────────────────────────────────────────────
 */
export function buildTrend(ctx: PdfContext, index: string): Content[] {
  const p = ctx.theme.palette;
  const cw = contentWidth(ctx.options.pageSize);
  const cur = ctx.report.currency;
  const points = ctx.report.trend ?? [];

  const heading = sectionHeading({ index, eyebrow: 'Over time', title: 'Income momentum', subtitle: `${points.length} periods`, palette: p, width: cw });

  if (!points.length) {
    return [heading, { text: 'No time-series data available for this range.', italics: true, color: p.inkFaint, fontSize: 10, margin: [0, 4, 0, 6] }];
  }

  const peak = points.reduce((a, b) => (b.total > a.total ? b : a), points[0]);
  const sum = points.reduce((s, pt) => s + pt.total, 0);
  const avg = sum / points.length;

  const chart = barChart({
    points: points.map((pt) => ({ label: pt.label, total: pt.total })),
    currency: cur,
    palette: p,
    series: ctx.theme.series,
    width: cw,
    height: 210,
  });

  const readout: Content = {
    columns: [
      readoutCard(p, 'Peak period', peak.label, formatMoney(peak.total, cur), (cw - 16) / 2),
      readoutCard(p, 'Average / period', `${points.length} periods`, formatMoney(avg, cur), (cw - 16) / 2),
    ],
    columnGap: 16,
    margin: [0, 10, 0, 6],
  };

  return [heading, chart, readout];
}

function readoutCard(
  p: PdfContext['theme']['palette'],
  label: string,
  sub: string,
  value: string,
  w: number,
): Content {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="56" viewBox="0 0 ${w} 56">
  <rect x="0.5" y="0.5" width="${w - 1}" height="55" rx="12" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="0.5" y="0.5" width="4" height="55" rx="2" fill="${p.accent}"/>
  <text x="16" y="22" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="8" letter-spacing="2">${label.toUpperCase()}</text>
  <text x="16" y="42" fill="${p.ink}" font-family="Georgia, serif" font-size="15" font-weight="700">${value}</text>
  <text x="${w - 14}" y="42" fill="${p.inkSoft}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" text-anchor="end">${sub}</text>
</svg>`.trim();
  return { svg, width: w };
}
