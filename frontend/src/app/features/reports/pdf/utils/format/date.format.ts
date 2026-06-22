/**
 * ─────────────────────────────────────────────────────────────
 *  Date formatting helpers for the PDF
 * ─────────────────────────────────────────────────────────────
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parse(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** `22 June 2026`. */
export function formatLongDate(value: string | Date | null | undefined): string {
  const d = parse(value);
  if (!d) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** `22 Jun 2026`. */
export function formatMediumDate(value: string | Date | null | undefined): string {
  const d = parse(value);
  if (!d) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/** `22 Jun 2026 · 14:08`. */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = parse(value);
  if (!d) return '—';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatMediumDate(d)} · ${hh}:${mm}`;
}

/** Human range label from two optional ISO dates. */
export function formatRangeLabel(start: string | null, end: string | null): string {
  if (!start && !end) return 'All time';
  if (start && end) return `${formatMediumDate(start)} — ${formatMediumDate(end)}`;
  if (start) return `From ${formatMediumDate(start)}`;
  return `Up to ${formatMediumDate(end)}`;
}
