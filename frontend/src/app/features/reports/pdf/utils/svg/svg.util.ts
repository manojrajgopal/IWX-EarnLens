/**
 * ─────────────────────────────────────────────────────────────
 *  SVG string helpers — tiny builders for vector chrome
 * ─────────────────────────────────────────────────────────────
 *  pdfmake renders raw SVG strings via the `{ svg }` node, so the
 *  whole document's artwork is crisp vector — never rasterised.
 */

/** XML-escape text destined for an SVG `<text>` node. */
export function escapeSvgText(value: string): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wrap inner markup into a sized `<svg>` root. */
export function svgRoot(width: number, height: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg>`;
}

/** A rounded-rect path string. */
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const radius = Math.min(r, w / 2, h / 2);
  return [
    `M${x + radius},${y}`,
    `h${w - radius * 2}`,
    `a${radius},${radius} 0 0 1 ${radius},${radius}`,
    `v${h - radius * 2}`,
    `a${radius},${radius} 0 0 1 ${-radius},${radius}`,
    `h${-(w - radius * 2)}`,
    `a${radius},${radius} 0 0 1 ${-radius},${-radius}`,
    `v${-(h - radius * 2)}`,
    `a${radius},${radius} 0 0 1 ${radius},${-radius}`,
    'z',
  ].join(' ');
}

/** A linear gradient `<defs>` block + id. */
export function linearGradient(
  id: string,
  stops: Array<{ offset: number; color: string; opacity?: number }>,
  angleDeg = 90,
): string {
  const rad = (angleDeg * Math.PI) / 180;
  const x2 = (Math.cos(rad) * 0.5 + 0.5).toFixed(4);
  const y2 = (Math.sin(rad) * 0.5 + 0.5).toFixed(4);
  const x1 = (0.5 - Math.cos(rad) * 0.5).toFixed(4);
  const y1 = (0.5 - Math.sin(rad) * 0.5).toFixed(4);
  const body = stops
    .map(
      (s) =>
        `<stop offset="${s.offset}%" stop-color="${s.color}" stop-opacity="${s.opacity ?? 1}"/>`,
    )
    .join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${body}</linearGradient>`;
}
