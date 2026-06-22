import type { Content } from 'pdfmake/interfaces';
import { PdfPalette } from '../../models/pdf-theme.model';
import { escapeSvgText } from '../../utils/svg/svg.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  Donut chart — proportional ring with a centred headline
 * ─────────────────────────────────────────────────────────────
 */
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartOptions {
  slices: DonutSlice[];
  centerTop: string;
  centerValue: string;
  palette: PdfPalette;
  size: number;
}

export function donutChart(o: DonutChartOptions): Content {
  const p = o.palette;
  const size = o.size;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const stroke = size * 0.13;
  const rInner = r - stroke / 2;
  const total = Math.max(1, o.slices.reduce((sum, s) => sum + Math.max(0, s.value), 0));

  let angle = -Math.PI / 2;
  const arcs: string[] = [];
  o.slices.forEach((s) => {
    const frac = Math.max(0, s.value) / total;
    if (frac <= 0) return;
    const end = angle + frac * Math.PI * 2;
    const large = end - angle > Math.PI ? 1 : 0;
    const x1 = cx + Math.cos(angle) * rInner;
    const y1 = cy + Math.sin(angle) * rInner;
    const x2 = cx + Math.cos(end) * rInner;
    const y2 = cy + Math.sin(end) * rInner;
    arcs.push(
      `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${rInner},${rInner} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-linecap="butt"/>`,
    );
    angle = end;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="${p.panelAlt}" stroke-width="${stroke}"/>
  ${arcs.join('')}
  <text x="${cx}" y="${cy - 4}" fill="${p.inkFaint}" font-family="Helvetica, Arial, sans-serif" font-size="7" letter-spacing="1.5" text-anchor="middle">${escapeSvgText(o.centerTop.toUpperCase())}</text>
  <text x="${cx}" y="${cy + 12}" fill="${p.ink}" font-family="Georgia, serif" font-size="14" font-weight="700" text-anchor="middle">${escapeSvgText(o.centerValue)}</text>
</svg>`.trim();
  return { svg, width: size };
}
