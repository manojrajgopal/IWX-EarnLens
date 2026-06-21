import { TrendColors } from '../config/chart.config';
import { ChartPoint, ChartSegment } from '../models/chart.types';

/** `M…L…L…` poly-line through every point. */
export function buildLinePath(points: ChartPoint[]): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');
}

/** Closed area path: the line, dropped to the baseline and back. */
export function buildAreaPath(points: ChartPoint[], baseY: number): string {
  if (!points.length) {
    return '';
  }
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L${last.x.toFixed(2)},${baseY.toFixed(2)} L${first.x.toFixed(2)},${baseY.toFixed(2)} Z`;
}

/** Pick the trend colour for the transition `a → b`. */
function trendColor(a: number, b: number, colors: TrendColors): string {
  if (b > a) {
    return colors.up;
  }
  if (b < a) {
    return colors.down;
  }
  return colors.flat;
}

/**
 * Split a line into per-segment fragments coloured by direction:
 * rising = green, falling = red, flat = yellow.
 */
export function buildSegments(points: ChartPoint[], colors: TrendColors): ChartSegment[] {
  const segments: ChartSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    segments.push({
      d: `M${a.x.toFixed(2)},${a.y.toFixed(2)} L${b.x.toFixed(2)},${b.y.toFixed(2)}`,
      color: trendColor(a.value, b.value, colors),
    });
  }
  return segments;
}

/**
 * Directional area: one filled trapezoid per segment, tinted by the same
 * trend colour as its line fragment for a cinematic, signal-coloured fill.
 */
export function buildAreaSegments(
  points: ChartPoint[],
  baseY: number,
  colors: TrendColors,
): ChartSegment[] {
  const segments: ChartSegment[] = [];
  const b = baseY.toFixed(2);
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const c = points[i + 1];
    segments.push({
      d:
        `M${a.x.toFixed(2)},${a.y.toFixed(2)} ` +
        `L${c.x.toFixed(2)},${c.y.toFixed(2)} ` +
        `L${c.x.toFixed(2)},${b} ` +
        `L${a.x.toFixed(2)},${b} Z`,
      color: trendColor(a.value, c.value, colors),
    });
  }
  return segments;
}
