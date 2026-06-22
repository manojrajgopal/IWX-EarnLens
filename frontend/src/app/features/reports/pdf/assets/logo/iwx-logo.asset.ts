import { escapeSvgText } from '../../utils/svg/svg.util';

/**
 * ─────────────────────────────────────────────────────────────
 *  IWX seal — the circular brand emblem, drawn as pure vector
 * ─────────────────────────────────────────────────────────────
 *  Recreates the uploaded badge ("SINCE 2025 · IWX · SHAPING
 *  DREAMS WITH TIMELESS WAVES") so it stays razor-sharp at any
 *  size inside the PDF. Every colour is theme-driven.
 */
export interface LogoColors {
  /** Disc gradient — outer. */
  discFrom: string;
  /** Disc gradient — inner. */
  discTo: string;
  /** Rings & ticks. */
  ring: string;
  /** Circular micro-text. */
  text: string;
  /** Wave motif. */
  wave: string;
  /** Central "IWX" wordmark. */
  mark: string;
}

const TOP_TEXT = 'SHAPING DREAMS WITH TIMELESS WAVES';
const BOTTOM_TEXT = '· SINCE 2025 ·';

/** Build the seal as a standalone SVG string. */
export function buildLogoSvg(c: LogoColors): string {
  const cx = 120;
  const cy = 120;
  const topText = circularText(TOP_TEXT, cx, cy, 90, -90, 200, 'top', c.text, 12, 700);
  const bottomText = circularText(BOTTOM_TEXT, cx, cy, 88, 90, 70, 'bottom', c.text, 11.5, 600);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <radialGradient id="iwxDisc" cx="38%" cy="32%" r="78%">
      <stop offset="0%" stop-color="${c.discFrom}"/>
      <stop offset="100%" stop-color="${c.discTo}"/>
    </radialGradient>
  </defs>

  <circle cx="120" cy="120" r="116" fill="url(#iwxDisc)"/>
  <circle cx="120" cy="120" r="110" fill="none" stroke="${c.ring}" stroke-width="2.5"/>
  <circle cx="120" cy="120" r="104" fill="none" stroke="${c.ring}" stroke-width="1" stroke-opacity="0.55"/>
  ${buildTicks(c.ring)}

  ${topText}
  ${bottomText}

  <circle cx="120" cy="120" r="70" fill="none" stroke="${c.ring}" stroke-width="1.4" stroke-opacity="0.7"/>

  <!-- timeless waves -->
  <g stroke="${c.wave}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="0.92">
    <path d="M82,150 q12,-13 24,0 q12,13 24,0 q12,-13 24,0"/>
    <path d="M86,160 q11,-11 22,0 q11,11 22,0 q11,-11 22,0" stroke-opacity="0.6"/>
  </g>

  <!-- IWX wordmark -->
  <text x="120" y="116" fill="${c.mark}" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="700" letter-spacing="2" text-anchor="middle">IWX</text>

  <!-- crowning star -->
  <path d="M120,40 l3.4,7 7.6,1 -5.5,5.4 1.3,7.6 -6.8,-3.6 -6.8,3.6 1.3,-7.6 -5.5,-5.4 7.6,-1 z" fill="${c.ring}"/>
</svg>`.trim();
}

/** Lay a string around a circle as upright, individually-rotated glyphs. */
function circularText(
  text: string,
  cx: number,
  cy: number,
  r: number,
  centerDeg: number,
  arcDeg: number,
  side: 'top' | 'bottom',
  color: string,
  size: number,
  weight: number,
): string {
  const chars = text.split('');
  const n = chars.length;
  const start = centerDeg - arcDeg / 2;
  const step = n > 1 ? arcDeg / (n - 1) : 0;
  const glyphs: string[] = [];
  chars.forEach((ch, i) => {
    const deg = side === 'top' ? start + step * i : centerDeg + arcDeg / 2 - step * i;
    const rad = (deg * Math.PI) / 180;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    const rot = side === 'top' ? deg + 90 : deg - 90;
    glyphs.push(
      `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${color}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="middle" transform="rotate(${rot.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})">${escapeSvgText(ch)}</text>`,
    );
  });
  return `<g>${glyphs.join('')}</g>`;
}

/** 60 fine ticks around the outer ring. */
function buildTicks(color: string): string {
  const cx = 120;
  const cy = 120;
  const rOuter = 110;
  const rInner = 105;
  const parts: string[] = [];
  for (let i = 0; i < 60; i += 1) {
    const a = (i / 60) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * rInner;
    const y1 = cy + Math.sin(a) * rInner;
    const x2 = cx + Math.cos(a) * rOuter;
    const y2 = cy + Math.sin(a) * rOuter;
    const major = i % 5 === 0;
    parts.push(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${major ? 1.6 : 0.7}" stroke-opacity="${major ? 0.9 : 0.45}"/>`,
    );
  }
  return `<g>${parts.join('')}</g>`;
}
