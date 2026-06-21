import { YTick } from '../models/chart.types';

/**
 * Round a positive number up to a "nice" value (1, 2, 2.5 or 5 × 10ⁿ).
 * Used to derive clean, human-readable axis maxima and step sizes.
 */
export function niceCeil(value: number): number {
  if (value <= 0) {
    return 1;
  }
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const frac = value / base;
  let nice: number;
  if (frac <= 1) {
    nice = 1;
  } else if (frac <= 2) {
    nice = 2;
  } else if (frac <= 2.5) {
    nice = 2.5;
  } else if (frac <= 5) {
    nice = 5;
  } else {
    nice = 10;
  }
  return nice * base;
}

/**
 * Derive a clean y-axis scale: a rounded maximum that divides evenly into
 * `steps` nice increments, always anchored at zero.
 */
export function computeYScale(rawMax: number, steps: number): { max: number; step: number } {
  const safeMax = rawMax > 0 ? rawMax : 1;
  const step = niceCeil(safeMax / steps);
  return { max: step * steps, step };
}

/**
 * Build evenly spaced y-axis ticks (value + pixel position) from the bottom
 * (0) to the top (max) of the plot area.
 */
export function buildYTicks(max: number, step: number, plotTop: number, plotH: number): YTick[] {
  const ticks: YTick[] = [];
  for (let value = 0; value <= max + step * 1e-6; value += step) {
    const y = plotTop + plotH - (value / max) * plotH;
    ticks.push({ value, y });
  }
  return ticks;
}
