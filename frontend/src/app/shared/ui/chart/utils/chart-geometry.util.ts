import { CHART } from '../config/chart.config';
import { ChartLayout } from '../models/chart.types';

interface LayoutInput {
  count: number;
  containerW: number;
  isBar: boolean;
}

/**
 * Solve the horizontal layout.
 *
 * The chart always fills at least the available width. When there are more
 * categories than will comfortably fit (each needs `minSlot` px) the inner
 * width grows past the container and the wrapper scrolls — Angel-One style.
 */
export function computeLayout({ count, containerW, isBar }: LayoutInput): ChartLayout {
  const available = Math.max(
    0,
    containerW - CHART.yAxisWidth - CHART.padLeft - CHART.padRight,
  );
  // Lines span (n − 1) gaps between points; bars occupy n slots.
  const divisor = isBar ? Math.max(1, count) : Math.max(1, count - 1);
  const slot = Math.max(CHART.minSlot, available / divisor);
  const plotW = slot * divisor;
  const svgW = Math.max(
    containerW - CHART.yAxisWidth,
    CHART.padLeft + plotW + CHART.padRight,
  );
  return { slot, plotW, svgW };
}

/**
 * Horizontal centre (px) of category `i`.
 * Lines anchor points at slot boundaries; bars centre within each slot.
 */
export function xAt(i: number, count: number, layout: ChartLayout, isBar: boolean): number {
  if (isBar) {
    return CHART.padLeft + layout.slot * i + layout.slot / 2;
  }
  if (count <= 1) {
    return CHART.padLeft + layout.plotW / 2;
  }
  return CHART.padLeft + layout.slot * i;
}

/**
 * Inverse of {@link xAt}: map an SVG x-coordinate back to the nearest
 * category index (used for hover/crosshair).
 */
export function indexAt(
  svgX: number,
  count: number,
  layout: ChartLayout,
  isBar: boolean,
): number {
  if (count <= 1) {
    return 0;
  }
  const rel = svgX - CHART.padLeft;
  const raw = isBar ? Math.floor(rel / layout.slot) : Math.round(rel / layout.slot);
  return Math.min(count - 1, Math.max(0, raw));
}
