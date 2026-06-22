import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { PAGE_GEOMETRY } from '../../config/pdf-page.config';
import { escapeSvgText } from '../../utils/svg/svg.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Running header factory — slim brand lockup
 * ─────────────────────────────────────────────────────────────
 *  Suppressed on the cover page; elsewhere it prints a mini seal,
 *  the wordmark and the active range on a hairline rail.
 */
export function createHeader(ctx: PdfContext): (currentPage: number) => Content {
  const g = PAGE_GEOMETRY[ctx.options.pageSize];
  const w = g.width;
  const mL = g.margin[0];
  const mR = g.margin[2];
  const p = ctx.theme.palette;
  const coverOn = ctx.options.sections.cover;

  return (currentPage: number): Content => {
    if (coverOn && currentPage === 1) return '';
    const innerW = w - mL - mR;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${innerW}" height="46" viewBox="0 0 ${innerW} 46">
  <defs>
    <linearGradient id="hdSeal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.accent}"/>
      <stop offset="100%" stop-color="${p.accent2}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="6" width="30" height="30" rx="9" fill="url(#hdSeal)"/>
  <text x="15" y="26" fill="#ffffff" font-family="Georgia, serif" font-size="12" font-weight="700" text-anchor="middle">IWX</text>
  <text x="40" y="19" fill="${p.ink}" font-family="Georgia, serif" font-size="13" font-weight="700">EarnLens</text>
  <text x="40" y="31" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="7.5" letter-spacing="1.6">INCOME INTELLIGENCE</text>
  <text x="${innerW}" y="19" fill="${p.inkSoft}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="600" text-anchor="end">${escapeSvgText(ctx.meta.rangeLabel)}</text>
  <text x="${innerW}" y="31" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="7.5" text-anchor="end">${escapeSvgText(ctx.meta.edition)}</text>
  <rect x="0" y="42" width="${innerW}" height="1" fill="${p.line}"/>
</svg>`.trim();
    return { svg, width: innerW, margin: [mL, 30, mR, 0] };
  };
}
