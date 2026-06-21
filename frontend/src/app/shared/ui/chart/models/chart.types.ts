/**
 * Geometric primitives produced by the chart engine and consumed by the
 * template. These are pure view-models — no DOM, no Angular — so the math is
 * fully unit-testable in isolation.
 */

/** A single plotted vertex in SVG pixel space. */
export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

/** A coloured path fragment (one segment of a directional line or area). */
export interface ChartSegment {
  d: string;
  color: string;
}

/** A fully resolved series ready to render as line / area. */
export interface ChartSeriesPlot {
  key: string;
  label: string;
  color: string;
  points: ChartPoint[];
  /** Continuous path for solid (multi-series) lines. */
  linePath: string;
  /** Continuous closed path for solid (multi-series) area fills. */
  areaPath: string;
  /** Per-segment coloured line fragments (single-series directional mode). */
  segments: ChartSegment[];
  /** Per-segment coloured area trapezoids (single-series directional area). */
  areaSegments: ChartSegment[];
}

/** A single rectangle for bar / stacked rendering. */
export interface ChartBar {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  value: number;
  label: string;
  seriesLabel: string;
}

export interface YTick {
  value: number;
  y: number;
}

export interface XTick {
  label: string;
  x: number;
  show: boolean;
}

export interface LegendItem {
  label: string;
  color: string;
}

export interface HoverState {
  index: number;
  x: number;
}

/** Result of the horizontal layout solver. */
export interface ChartLayout {
  /** Horizontal pixels per category. */
  slot: number;
  /** Width of the inner plotting region (px). */
  plotW: number;
  /** Total SVG width including paddings (px). */
  svgW: number;
}
