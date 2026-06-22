import type { Content } from 'pdfmake/interfaces';
import { PdfPalette } from '../../models/pdf-theme.model';
import { escapeSvgText } from '../../utils/svg/svg.util';
import { formatMoneyCompact } from '../../utils/format/money.format';
import { lighten } from '../../utils/color/color.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Bar chart — vector momentum columns with gridlines & glow
 * ─────────────────────────────────────────────────────────────
 */
export interface BarChartPoint {
  label: string;
  total: number;
}

export interface BarChartOptions {
  points: BarChartPoint[];
  currency: string;
  palette: PdfPalette;
  series: string[];
  width: number;
  height: number;
}

export function barChart(o: BarChartOptions): Content {
  const p = o.palette;
  const w = o.width;
  const h = o.height;
  const padL = 14;
  const padR = 14;
  const padT = 16;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const points = o.points.length ? o.points : [{ label: '—', total: 0 }];
  const max = Math.max(1, ...points.map((pt) => pt.total));
  const n = points.length;
  const slot = plotW / n;
  const barW = Math.min(34, slot * 0.56);

  const gridlines: string[] = [];
  const steps = 4;
  for (let i = 0; i <= steps; i += 1) {
    const y = padT + (plotH * i) / steps;
    const val = max * (1 - i / steps);
    gridlines.push(
      `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${padL + plotW}" y2="${y.toFixed(1)}" stroke="${p.line}" stroke-width="0.7" stroke-dasharray="2 3"/>`,
      `<text x="${padL - 2}" y="${(y + 3).toFixed(1)}" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="6.5" text-anchor="end">${escapeSvgText(formatMoneyCompact(val, o.currency))}</text>`,
    );
  }

  const bars: string[] = [];
  points.forEach((pt, i) => {
    const cx = padL + slot * i + slot / 2;
    const bh = Math.max(2, (pt.total / max) * plotH);
    const y = padT + plotH - bh;
    const x = cx - barW / 2;
    const color = o.series[i % o.series.length];
    bars.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${color}"/>`,
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.min(bh, 6).toFixed(1)}" rx="3" fill="${lighten(color, 0.35)}"/>`,
      `<text x="${cx.toFixed(1)}" y="${(padT + plotH + 12).toFixed(1)}" fill="${p.inkSoft}" font-family="Helvetica, Arial, sans-serif" font-size="6.8" text-anchor="middle">${escapeSvgText(truncate(pt.label, 10))}</text>`,
    );
    if (n <= 14) {
      bars.push(
        `<text x="${cx.toFixed(1)}" y="${(y - 4).toFixed(1)}" fill="${p.ink}" font-family="Helvetica, Arial, sans-serif" font-size="6.4" font-weight="700" text-anchor="middle">${escapeSvgText(formatMoneyCompact(pt.total, o.currency))}</text>`,
      );
    }
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${p.paper}" stroke="${p.line}"/>
  ${gridlines.join('')}
  <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="${p.inkFaint}" stroke-width="1"/>
  ${bars.join('')}
</svg>`.trim();
  return { svg, width: w };
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
