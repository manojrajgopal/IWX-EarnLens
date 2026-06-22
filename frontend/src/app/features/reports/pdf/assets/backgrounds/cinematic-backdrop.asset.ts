import { PdfPalette } from '../../models/pdf-theme.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Cinematic backdrops — full-bleed vector page artwork
 * ─────────────────────────────────────────────────────────────
 *  Returned as SVG strings sized to the exact page (in points),
 *  so the gradient, aurora glows and wave field cover every edge.
 */

/** Dramatic full-bleed cover backdrop. */
export function buildCoverBackdrop(p: PdfPalette, w: number, h: number): string {
  const waves = buildWaveField(p.coverGlow, w, h, 0.10);
  const stars = buildStarField(p.onCover, w, h);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="coverBg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${p.coverFrom}"/>
      <stop offset="52%" stop-color="${p.coverMid}"/>
      <stop offset="100%" stop-color="${p.coverTo}"/>
    </linearGradient>
    <radialGradient id="coverGlowA" cx="78%" cy="16%" r="62%">
      <stop offset="0%" stop-color="${p.coverGlow}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${p.coverGlow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="coverGlowB" cx="12%" cy="92%" r="55%">
      <stop offset="0%" stop-color="${p.accent3}" stop-opacity="0.40"/>
      <stop offset="100%" stop-color="${p.accent3}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#coverBg)"/>
  <rect width="${w}" height="${h}" fill="url(#coverGlowA)"/>
  <rect width="${w}" height="${h}" fill="url(#coverGlowB)"/>
  ${stars}
  ${waves}
  <rect x="22" y="22" width="${w - 44}" height="${h - 44}" rx="10" fill="none" stroke="${p.onCover}" stroke-opacity="0.18" stroke-width="1"/>
  <rect x="27" y="27" width="${w - 54}" height="${h - 54}" rx="8" fill="none" stroke="${p.coverGlow}" stroke-opacity="0.22" stroke-width="0.6"/>
</svg>`.trim();
}

/** Subtle content-page backdrop (paper + faint wave + side rail). */
export function buildContentBackdrop(p: PdfPalette, w: number, h: number): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="pageBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.paper}"/>
      <stop offset="100%" stop-color="${p.panel}"/>
    </linearGradient>
    <radialGradient id="pageGlow" cx="92%" cy="6%" r="40%">
      <stop offset="0%" stop-color="${p.accentSoft}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${p.accentSoft}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#pageBg)"/>
  <rect width="${w}" height="${h}" fill="url(#pageGlow)"/>
  <path d="M0,${h - 60} q${w / 4},-34 ${w / 2},0 q${w / 4},34 ${w / 2},0 L${w},${h} L0,${h} z" fill="${p.accentSoft}" fill-opacity="0.35"/>
  <rect x="0" y="0" width="5" height="${h}" fill="${p.accent}" fill-opacity="0.9"/>
  <rect x="5" y="0" width="2" height="${h}" fill="${p.accent2}" fill-opacity="0.55"/>
</svg>`.trim();
}

/** A horizon of layered sine waves. */
function buildWaveField(color: string, w: number, h: number, opacity: number): string {
  const layers: string[] = [];
  const count = 4;
  for (let i = 0; i < count; i += 1) {
    const baseY = h * 0.62 + i * 26;
    const amp = 18 + i * 6;
    const step = w / 6;
    let d = `M0,${baseY}`;
    for (let x = 0; x <= w; x += step) {
      const dir = (x / step) % 2 === 0 ? -amp : amp;
      d += ` q${step / 2},${dir} ${step},0`;
    }
    d += ` L${w},${h} L0,${h} z`;
    layers.push(
      `<path d="${d}" fill="${color}" fill-opacity="${(opacity - i * 0.018).toFixed(3)}"/>`,
    );
  }
  return `<g>${layers.join('')}</g>`;
}

/** Sparse star/particle field for the cover. */
function buildStarField(color: string, w: number, h: number): string {
  const pts: string[] = [];
  let seed = 9173;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 46; i += 1) {
    const x = (rand() * w).toFixed(1);
    const y = (rand() * h * 0.55).toFixed(1);
    const r = (rand() * 1.3 + 0.3).toFixed(2);
    const o = (rand() * 0.5 + 0.15).toFixed(2);
    pts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="${o}"/>`);
  }
  return `<g>${pts.join('')}</g>`;
}
