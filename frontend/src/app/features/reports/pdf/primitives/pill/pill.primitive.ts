import { escapeSvgText } from '../../utils/svg/svg.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Pill — a small rounded tag rendered as an SVG snippet
 * ─────────────────────────────────────────────────────────────
 *  Returns a raw SVG string so callers can place several pills in
 *  a pdfmake columns row.
 */
export interface PillOptions {
  text: string;
  fill: string;
  textColor: string;
  border?: string;
  width: number;
  height?: number;
}

export function pillSvg(o: PillOptions): string {
  const h = o.height ?? 20;
  const w = o.width;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${h / 2}" fill="${o.fill}" ${o.border ? `stroke="${o.border}" stroke-width="1"` : ''}/>
  <text x="${w / 2}" y="${h / 2 + 3.2}" fill="${o.textColor}" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" letter-spacing="1" text-anchor="middle">${escapeSvgText(o.text.toUpperCase())}</text>
</svg>`.trim();
}
