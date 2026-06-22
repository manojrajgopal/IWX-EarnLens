import type { Content } from 'pdfmake/interfaces';
import { PdfPalette } from '../../models/pdf-theme.model';
import { escapeSvgText } from '../../utils/svg/svg.util';
import { lighten } from '../../utils/color/color.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Distribution row — a labelled share bar with value
 * ─────────────────────────────────────────────────────────────
 */
export interface DistributionRowOptions {
  rank: number;
  label: string;
  amountLabel: string;
  countLabel: string;
  percentage: number;
  color: string;
  palette: PdfPalette;
  width: number;
}

export function distributionRow(o: DistributionRowOptions): Content {
  const p = o.palette;
  const w = o.width;
  const h = 40;
  const labelW = Math.min(150, w * 0.32);
  const valueW = 92;
  const trackX = labelW + 8;
  const trackW = w - labelW - valueW - 16;
  const pct = Math.max(0, Math.min(100, o.percentage));
  const fillW = Math.max(3, (trackW * pct) / 100);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="dist${o.rank}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${lighten(o.color, 0.2)}"/>
      <stop offset="100%" stop-color="${o.color}"/>
    </linearGradient>
  </defs>
  <circle cx="9" cy="${h / 2}" r="4.5" fill="${o.color}"/>
  <text x="20" y="${h / 2 - 2}" fill="${p.ink}" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="600">${escapeSvgText(truncate(o.label, 22))}</text>
  <text x="20" y="${h / 2 + 11}" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="7.5">${escapeSvgText(o.countLabel)}</text>
  <rect x="${trackX}" y="${h / 2 - 6}" width="${trackW}" height="12" rx="6" fill="${p.panelAlt}"/>
  <rect x="${trackX}" y="${h / 2 - 6}" width="${fillW.toFixed(1)}" height="12" rx="6" fill="url(#dist${o.rank})"/>
  <text x="${w}" y="${h / 2 - 2}" fill="${p.ink}" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="700" text-anchor="end">${escapeSvgText(o.amountLabel)}</text>
  <text x="${w}" y="${h / 2 + 11}" fill="${o.color}" font-family="Helvetica, Arial, sans-serif" font-size="7.8" font-weight="700" text-anchor="end">${pct.toFixed(1)}%</text>
</svg>`.trim();
  return { svg, width: w };
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
