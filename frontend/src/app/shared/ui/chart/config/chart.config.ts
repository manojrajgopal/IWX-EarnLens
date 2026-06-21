/**
 * Static layout + visual configuration for the analytics chart.
 *
 * Everything here is expressed in **constant pixels** so the chart renders
 * at its native resolution (no `preserveAspectRatio` distortion). Fonts and
 * stroke widths therefore stay identical regardless of how wide the chart
 * grows or how many points it plots.
 */
export const CHART = {
  /** Total drawing height of the plot SVG, in px. */
  height: 340,
  /** Inner paddings of the plot area (px). The y-axis lives in an external gutter. */
  padTop: 18,
  padBottom: 36,
  padLeft: 16,
  padRight: 20,
  /** Width of the fixed (non-scrolling) y-axis label gutter (px). */
  yAxisWidth: 64,
  /** Minimum horizontal space allotted to each category before scrolling kicks in (px). */
  minSlot: 56,
  /** Number of horizontal gridlines / y-axis ticks (segments, not lines). */
  yTicks: 5,
  /** Group (all bars at one label) width as a fraction of the slot. */
  barGroupRatio: 0.66,
  /** Inner gap between bars of a grouped (multi-series) cluster (px). */
  barGap: 3,
  /** Constant axis font size (px). */
  axisFont: 12,
  /** Minimum horizontal pixels reserved for one x-axis label before thinning. */
  xLabelGap: 60,
} as const;

/**
 * Directional line colours — the Angel-One style trend cue.
 * A rising segment is green, a falling one red, a flat one yellow.
 */
export const TREND_COLORS = {
  up: '#16a34a',
  down: '#ef4444',
  flat: '#eab308',
} as const;

export type TrendColors = typeof TREND_COLORS;
