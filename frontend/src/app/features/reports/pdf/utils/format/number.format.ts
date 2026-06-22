/**
 * ─────────────────────────────────────────────────────────────
 *  Number formatting helpers
 * ─────────────────────────────────────────────────────────────
 */

/** Grouped integer, e.g. `1,284`. */
export function formatInt(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return new Intl.NumberFormat('en-US').format(safe);
}

/** Percentage with one decimal, e.g. `42.5%`. */
export function formatPercent(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(1)}%`;
}

/** Clamp a number into a range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
