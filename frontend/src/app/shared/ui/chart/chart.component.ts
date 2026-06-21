import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ChartStyle, GraphSeries } from '../../../core/models/analytics.model';
import { CHART_PALETTE } from '../../../core/constants/app.constants';
import { MoneyPipe } from '../../pipes/money.pipe';

interface PlottedPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

interface PlottedSeries {
  key: string;
  label: string;
  color: string;
  points: PlottedPoint[];
  linePath: string;
  areaPath: string;
}

interface PlottedBar {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  value: number;
  label: string;
  seriesLabel: string;
}

const VIEW_W = 760;
const VIEW_H = 320;
const PAD = { top: 24, right: 24, bottom: 40, left: 56 };

/**
 * Dependency-free SVG analytics chart supporting line, area, bar and
 * stacked-bar rendering for one or many series.
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  readonly labels = input<string[]>([]);
  readonly series = input<GraphSeries[]>([]);
  readonly style = input<ChartStyle>('area');
  readonly currency = input<string>('USD');

  readonly viewW = VIEW_W;
  readonly viewH = VIEW_H;
  readonly plotW = VIEW_W - PAD.left - PAD.right;
  readonly plotH = VIEW_H - PAD.top - PAD.bottom;
  readonly padLeft = PAD.left;
  readonly padTop = PAD.top;
  readonly padBottom = PAD.bottom;

  readonly hover = signal<{ index: number; x: number } | null>(null);

  private readonly maxValue = computed(() => {
    const style = this.style();
    const series = this.series();
    if (!series.length) {
      return 1;
    }
    if (style === 'stacked') {
      const sums = this.labels().map((_, i) =>
        series.reduce((acc, s) => acc + (s.points[i]?.total ?? 0), 0),
      );
      return Math.max(1, ...sums);
    }
    const all = series.flatMap((s) => s.points.map((p) => p.total));
    return Math.max(1, ...all);
  });

  readonly yTicks = computed(() => {
    const max = this.maxValue();
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = (max / steps) * i;
      return { value, y: PAD.top + this.plotH - (value / max) * this.plotH };
    });
  });

  readonly xLabels = computed(() => {
    const labels = this.labels();
    const n = labels.length || 1;
    const every = Math.ceil(n / 8);
    return labels.map((label, i) => ({
      label,
      x: this.xCenter(i, n),
      show: i % every === 0 || i === n - 1,
    }));
  });

  readonly plottedSeries = computed<PlottedSeries[]>(() => {
    const labels = this.labels();
    const n = labels.length || 1;
    const max = this.maxValue();
    return this.series().map((s, si) => {
      const color = s.color ?? CHART_PALETTE[si % CHART_PALETTE.length];
      const points: PlottedPoint[] = labels.map((label, i) => {
        const value = s.points[i]?.total ?? 0;
        return {
          x: this.xCenter(i, n),
          y: PAD.top + this.plotH - (value / max) * this.plotH,
          value,
          label,
        };
      });
      const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');
      const baseY = PAD.top + this.plotH;
      const areaPath = points.length
        ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${baseY} L${points[0].x.toFixed(1)},${baseY} Z`
        : '';
      return { key: s.key, label: s.label, color, points, linePath, areaPath };
    });
  });

  readonly plottedBars = computed<PlottedBar[]>(() => {
    const labels = this.labels();
    const n = labels.length || 1;
    const max = this.maxValue();
    const series = this.series();
    const stacked = this.style() === 'stacked';
    const slot = this.plotW / n;
    const groupWidth = slot * 0.7;
    const baseY = PAD.top + this.plotH;
    const bars: PlottedBar[] = [];

    labels.forEach((label, i) => {
      const center = this.xCenter(i, n);
      if (stacked) {
        let cursor = baseY;
        series.forEach((s, si) => {
          const value = s.points[i]?.total ?? 0;
          const h = (value / max) * this.plotH;
          cursor -= h;
          bars.push({
            x: center - groupWidth / 2,
            y: cursor,
            width: groupWidth,
            height: h,
            color: s.color ?? CHART_PALETTE[si % CHART_PALETTE.length],
            value,
            label,
            seriesLabel: s.label,
          });
        });
      } else {
        const barWidth = groupWidth / series.length;
        series.forEach((s, si) => {
          const value = s.points[i]?.total ?? 0;
          const h = (value / max) * this.plotH;
          bars.push({
            x: center - groupWidth / 2 + si * barWidth,
            y: baseY - h,
            width: Math.max(2, barWidth - 2),
            height: h,
            color: s.color ?? CHART_PALETTE[si % CHART_PALETTE.length],
            value,
            label,
            seriesLabel: s.label,
          });
        });
      }
    });
    return bars;
  });

  readonly legend = computed(() =>
    this.series().map((s, i) => ({
      label: s.label,
      color: s.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
    })),
  );

  readonly hoverRows = computed(() => {
    const h = this.hover();
    if (!h) {
      return null;
    }
    const label = this.labels()[h.index] ?? '';
    const rows = this.series().map((s, i) => ({
      label: s.label,
      color: s.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
      value: s.points[h.index]?.total ?? 0,
    }));
    return { label, rows, x: h.x };
  });

  isBar(): boolean {
    return this.style() === 'bar' || this.style() === 'stacked';
  }

  isArea(): boolean {
    return this.style() === 'area';
  }

  onMove(event: MouseEvent, svg: SVGSVGElement): void {
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const n = this.labels().length || 1;
    const rel = (x - PAD.left) / this.plotW;
    const index = Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1))));
    this.hover.set({ index, x: this.xCenter(index, n) });
  }

  clearHover(): void {
    this.hover.set(null);
  }

  private xCenter(i: number, n: number): number {
    if (n === 1) {
      return PAD.left + this.plotW / 2;
    }
    return PAD.left + (this.plotW / (n - 1)) * i;
  }
}
