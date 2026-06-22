import type { Content } from 'pdfmake/interfaces';
import { PdfPalette } from '../../models/pdf-theme.model';
import { escapeSvgText } from '../../utils/svg/svg.util';
import { lighten } from '../../utils/color/color.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  KPI card — a single luminous headline metric
 * ─────────────────────────────────────────────────────────────
 */
export interface KpiCardOptions {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  palette: PdfPalette;
  width: number;
  height?: number;
}

export function kpiCard(o: KpiCardOptions): Content {
  const p = o.palette;
  const w = o.width;
  const h = o.height ?? 96;
  const tint = lighten(o.accent, 0.86);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="kpiFill${hash(o.label)}" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${tint}"/>
    </linearGradient>
    <linearGradient id="kpiBar${hash(o.label)}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lighten(o.accent, 0.18)}"/>
      <stop offset="100%" stop-color="${o.accent}"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" fill="url(#kpiFill${hash(o.label)})" stroke="${p.line}" stroke-width="1"/>
  <rect x="1" y="1" width="6" height="${h - 2}" rx="3" fill="url(#kpiBar${hash(o.label)})"/>
  <circle cx="${w - 22}" cy="24" r="13" fill="${o.accent}" fill-opacity="0.12"/>
  <circle cx="${w - 22}" cy="24" r="5" fill="${o.accent}"/>
  <text x="20" y="30" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" letter-spacing="2.4">${escapeSvgText(o.label.toUpperCase())}</text>
  <text x="20" y="${h - 28}" fill="${p.ink}" font-family="Georgia, serif" font-size="23" font-weight="700">${escapeSvgText(o.value)}</text>
  ${o.sub ? `<text x="20" y="${h - 12}" fill="${o.accent}" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="600">${escapeSvgText(o.sub)}</text>` : ''}
</svg>`.trim();
  return { svg, width: w };
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 99991;
  return String(h);
}
