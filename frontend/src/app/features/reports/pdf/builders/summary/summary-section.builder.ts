import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { contentWidth } from '../../config/pdf-page.config';
import { sectionHeading } from '../../primitives/section-heading/section-heading.primitive';
import { kpiCard } from '../../primitives/kpi-card/kpi-card.primitive';
import { escapeSvgText } from '../../utils/svg/svg.util';
import { formatMoney } from '../../utils/format/money.format';
import { formatInt } from '../../utils/format/number.format';

/**
 * ─────────────────────────────────────────────────────────────
 *  Executive summary builder — the headline KPI grid + spectrum
 * ─────────────────────────────────────────────────────────────
 */
export function buildSummary(ctx: PdfContext, index: string): Content[] {
  const p = ctx.theme.palette;
  const s = ctx.theme.series;
  const cw = contentWidth(ctx.options.pageSize);
  const t = ctx.report.totals;
  const cur = ctx.report.currency;

  const gap = 12;
  const cardW = (cw - gap * 3) / 4;

  const cards = [
    kpiCard({ label: 'Total income', value: formatMoney(t.total, cur), sub: 'Across all entries', accent: s[0], palette: p, width: cardW }),
    kpiCard({ label: 'Entries', value: formatInt(t.count), sub: 'Recorded transactions', accent: s[1], palette: p, width: cardW }),
    kpiCard({ label: 'Average', value: formatMoney(t.average, cur), sub: 'Per entry', accent: s[2], palette: p, width: cardW }),
    kpiCard({ label: 'Peak entry', value: formatMoney(t.maximum, cur), sub: 'Largest single', accent: s[3], palette: p, width: cardW }),
  ];

  return [
    sectionHeading({ index, eyebrow: 'Executive summary', title: 'The numbers at a glance', subtitle: ctx.meta.rangeLabel, palette: p, width: cw }),
    { columns: cards, columnGap: gap, margin: [0, 0, 0, 14] },
    spectrum(ctx, cw),
  ];
}

/** A min → max range bar showing where the average sits. */
function spectrum(ctx: PdfContext, w: number): Content {
  const p = ctx.theme.palette;
  const t = ctx.report.totals;
  const cur = ctx.report.currency;
  const h = 76;
  const padX = 18;
  const trackW = w - padX * 2;
  const span = Math.max(1, t.maximum - t.minimum);
  const avgX = padX + ((t.average - t.minimum) / span) * trackW;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="spec" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ctx.theme.series[2]}"/>
      <stop offset="50%" stop-color="${ctx.theme.series[0]}"/>
      <stop offset="100%" stop-color="${ctx.theme.series[3]}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="14" fill="${p.panel}" stroke="${p.line}"/>
  <text x="${padX}" y="24" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="8" letter-spacing="2.4">INCOME SPECTRUM</text>
  <rect x="${padX}" y="40" width="${trackW}" height="10" rx="5" fill="url(#spec)"/>
  <line x1="${avgX.toFixed(1)}" y1="33" x2="${avgX.toFixed(1)}" y2="57" stroke="${p.ink}" stroke-width="2"/>
  <circle cx="${avgX.toFixed(1)}" cy="33" r="3.4" fill="${p.ink}"/>
  <text x="${padX}" y="68" fill="${p.inkSoft}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700">${escapeSvgText('Min ' + formatMoney(t.minimum, cur))}</text>
  <text x="${avgX.toFixed(1)}" y="68" fill="${p.ink}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle">${escapeSvgText('Avg ' + formatMoney(t.average, cur))}</text>
  <text x="${w - padX}" y="68" fill="${p.inkSoft}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" text-anchor="end">${escapeSvgText('Max ' + formatMoney(t.maximum, cur))}</text>
</svg>`.trim();
  return { svg, width: w, margin: [0, 0, 0, 6] };
}
