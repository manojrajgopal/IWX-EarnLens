/**
 * ─────────────────────────────────────────────────────────────
 *  Money formatting — currency-aware, PDF-safe
 * ─────────────────────────────────────────────────────────────
 */

/** Full currency string, e.g. `$12,480.00`. */
export function formatMoney(value: number, currency: string): string {
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(2)}`;
  }
}

/** Compact currency for tight chart labels, e.g. `$12.5K`. */
export function formatMoneyCompact(value: number, currency: string): string {
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(0)}`;
  }
}
