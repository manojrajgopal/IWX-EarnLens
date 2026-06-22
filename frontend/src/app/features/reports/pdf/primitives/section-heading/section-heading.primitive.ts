import type { Content } from 'pdfmake/interfaces';
import { PdfPalette } from '../../models/pdf-theme.model';
import { escapeSvgText } from '../../utils/svg/svg.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Section heading — the cinematic chapter band
 * ─────────────────────────────────────────────────────────────
 */
export interface SectionHeadingOptions {
  index: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  palette: PdfPalette;
  width: number;
}

export function sectionHeading(o: SectionHeadingOptions): Content {
  const p = o.palette;
  const h = 58;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${h}" viewBox="0 0 ${o.width} ${h}">
  <defs>
    <linearGradient id="shBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.accent}"/>
      <stop offset="100%" stop-color="${p.accent2}"/>
    </linearGradient>
    <linearGradient id="shRule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="6" width="40" height="44" rx="8" fill="url(#shBar)"/>
  <text x="20" y="34" fill="#ffffff" font-family="Georgia, serif" font-size="17" font-weight="700" text-anchor="middle">${escapeSvgText(o.index)}</text>
  <text x="54" y="20" fill="${p.accent}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" letter-spacing="3">${escapeSvgText(o.eyebrow.toUpperCase())}</text>
  <text x="53" y="42" fill="${p.ink}" font-family="Georgia, serif" font-size="19" font-weight="700">${escapeSvgText(o.title)}</text>
  ${o.subtitle ? `<text x="${o.width}" y="20" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="9" text-anchor="end">${escapeSvgText(o.subtitle)}</text>` : ''}
  <rect x="54" y="50" width="${o.width - 54}" height="2" fill="url(#shRule)"/>
</svg>`.trim();
  return { svg, width: o.width, margin: [0, 0, 0, 12] };
}
