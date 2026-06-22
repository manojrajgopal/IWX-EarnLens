import type { Content } from 'pdfmake/interfaces';
import { PdfContext } from '../../models/pdf-context.model';
import { PAGE_GEOMETRY } from '../../config/pdf-page.config';
import { escapeSvgText } from '../../utils/svg/svg.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Running footer factory
 * ─────────────────────────────────────────────────────────────
 *  Cover: a single centred tagline. Content pages: paged counter,
 *  generated stamp and the brand wordmark on a gradient hairline.
 */
export function createFooter(ctx: PdfContext): (currentPage: number, pageCount: number) => Content {
  const g = PAGE_GEOMETRY[ctx.options.pageSize];
  const w = g.width;
  const mL = g.margin[0];
  const mR = g.margin[2];
  const p = ctx.theme.palette;
  const coverOn = ctx.options.sections.cover;

  return (currentPage: number, pageCount: number): Content => {
    const innerW = w - mL - mR;

    if (coverOn && currentPage === 1) {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${innerW}" height="30" viewBox="0 0 ${innerW} 30">
  <text x="${innerW / 2}" y="18" fill="${p.onCoverSoft}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" letter-spacing="3" text-anchor="middle">${escapeSvgText('SHAPING DREAMS WITH TIMELESS WAVES')}</text>
</svg>`.trim();
      return { svg, width: innerW, margin: [mL, 18, mR, 0] };
    }

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${innerW}" height="34" viewBox="0 0 ${innerW} 34">
  <defs>
    <linearGradient id="ftRule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${p.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="4" width="${innerW}" height="1" fill="url(#ftRule)"/>
  <text x="0" y="22" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="8">${escapeSvgText(ctx.meta.generatedLabel)}</text>
  <text x="${innerW / 2}" y="22" fill="${p.inkSoft}" font-family="Georgia, serif" font-size="9" font-weight="700" letter-spacing="2" text-anchor="middle">IWX · EARNLENS</text>
  <text x="${innerW}" y="22" fill="${p.inkSoft}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="600" text-anchor="end">${escapeSvgText(`Page ${currentPage} of ${pageCount}`)}</text>
</svg>`.trim();
    return { svg, width: innerW, margin: [mL, 12, mR, 0] };
  };
}
