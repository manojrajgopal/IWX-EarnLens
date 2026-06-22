import type { Content } from 'pdfmake/interfaces';
import { PdfPalette } from '../../models/pdf-theme.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Divider — a fading gradient hairline
 * ─────────────────────────────────────────────────────────────
 */
export interface DividerOptions {
  palette: PdfPalette;
  width: number;
  marginTop?: number;
  marginBottom?: number;
}

export function divider(o: DividerOptions): Content {
  const p = o.palette;
  const w = o.width;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="4" viewBox="0 0 ${w} 4">
  <defs>
    <linearGradient id="divGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${p.accent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="1.5" width="${w}" height="1" fill="url(#divGrad)"/>
</svg>`.trim();
  return { svg, width: w, margin: [0, o.marginTop ?? 8, 0, o.marginBottom ?? 8] };
}
