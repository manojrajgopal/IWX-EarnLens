/**
 * ─────────────────────────────────────────────────────────────
 *  Colour utilities — hex maths for cinematic shading
 * ─────────────────────────────────────────────────────────────
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function toRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex({ r, g, b }: Rgb): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix two hex colours by ratio (0 = a, 1 = b). */
export function mix(a: string, b: string, ratio: number): string {
  const ca = toRgb(a);
  const cb = toRgb(b);
  const t = Math.min(1, Math.max(0, ratio));
  return toHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

/** Lighten toward white. */
export function lighten(hex: string, amount: number): string {
  return mix(hex, '#ffffff', amount);
}

/** Darken toward black. */
export function darken(hex: string, amount: number): string {
  return mix(hex, '#000000', amount);
}

/** Build an `rgba()` string from hex + alpha. */
export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Pick a series colour by index, cycling. */
export function seriesColor(series: string[], index: number): string {
  if (!series.length) return '#6366f1';
  return series[index % series.length];
}
