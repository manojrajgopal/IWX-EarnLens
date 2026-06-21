import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ChartStyle, GraphSeries } from '../../../core/models/analytics.model';
import { CHART_PALETTE } from '../../../core/constants/app.constants';
import { MoneyPipe } from '../../pipes/money.pipe';
import { CHART, TREND_COLORS } from './config/chart.config';
import {
  ChartBar,
  ChartSeriesPlot,
  HoverState,
  LegendItem,
  XTick,
  YTick,
} from './models/chart.types';
import { buildYTicks, computeYScale } from './utils/chart-scale.util';
import { computeLayout, indexAt, xAt } from './utils/chart-geometry.util';
import {
  buildAreaPath,
  buildAreaSegments,
  buildLinePath,
  buildSegments,
} from './utils/chart-path.util';

/**
 * Dependency-free, fully responsive SVG analytics chart.
 *
 * Renders line / area / bar / stacked plots from one or many series. The
 * drawing surface scales horizontally (scrolling when crowded) while keeping
 * fonts and stroke widths pixel-constant. A single series is drawn with
 * Angel-One style directional colouring (green up · red down · yellow flat).
 *
 * This component is the trunk; the maths lives in the `utils/` leaves and the
 * tuning constants in `config/`, so every piece stays small and reusable.
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
  readonly currency = input<string>('INR');
  readonly height = input<number>(CHART.height);

  /** Live width of the host element, tracked via ResizeObserver. */
  private readonly containerW = signal(720);
  readonly hover = signal<HoverState | null>(null);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  // Exposed constants for the template.
  readonly cfg = CHART;
  readonly trend = TREND_COLORS;

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const ro = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        if (width > 0) {
          this.containerW.set(width);
        }
      });
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  // ------------------------------------------------------------------ //
  // Derived geometry
  // ------------------------------------------------------------------ //
  readonly hasData = computed(() => this.series().length > 0 && this.labels().length > 0);
  readonly count = computed(() => this.labels().length);
  readonly isBar = computed(() => this.style() === 'bar' || this.style() === 'stacked');
  readonly isStacked = computed(() => this.style() === 'stacked');
  readonly isArea = computed(() => this.style() === 'area');
  /** Single-series line/area gets the directional trend colouring. */
  readonly directional = computed(() => this.series().length === 1 && !this.isBar());

  readonly svgH = computed(() => this.height());
  readonly plotH = computed(() => this.svgH() - CHART.padTop - CHART.padBottom);
  readonly baseY = computed(() => CHART.padTop + this.plotH());

  readonly layout = computed(() =>
    computeLayout({
      count: this.count(),
      containerW: this.containerW(),
      isBar: this.isBar(),
    }),
  );
  readonly svgW = computed(() => this.layout().svgW);

  private readonly maxValue = computed(() => {
    const series = this.series();
    if (!series.length) {
      return 1;
    }
    if (this.isStacked()) {
      const sums = this.labels().map((_, i) =>
        series.reduce((acc, s) => acc + (s.points[i]?.total ?? 0), 0),
      );
      return Math.max(1, ...sums);
    }
    const all = series.flatMap((s) => s.points.map((p) => p.total));
    return Math.max(1, ...all);
  });

  private readonly yScale = computed(() => computeYScale(this.maxValue(), CHART.yTicks));

  readonly yTicks = computed<YTick[]>(() => {
    const { max, step } = this.yScale();
    return buildYTicks(max, step, CHART.padTop, this.plotH());
  });

  readonly xTicks = computed<XTick[]>(() => {
    const labels = this.labels();
    const n = labels.length || 1;
    const layout = this.layout();
    const isBar = this.isBar();
    const every = Math.max(1, Math.ceil(CHART.xLabelGap / layout.slot));
    return labels.map((label, i) => ({
      label,
      x: xAt(i, n, layout, isBar),
      show: i % every === 0 || i === n - 1,
    }));
  });

  // ------------------------------------------------------------------ //
  // Line / area series
  // ------------------------------------------------------------------ //
  readonly plottedSeries = computed<ChartSeriesPlot[]>(() => {
    const labels = this.labels();
    const { max } = this.yScale();
    const h = this.plotH();
    const baseY = this.baseY();
    const layout = this.layout();
    const n = labels.length || 1;
    const directional = this.directional();
    const area = this.isArea();

    return this.series().map((s, si) => {
      const color = s.color ?? CHART_PALETTE[si % CHART_PALETTE.length];
      const points = labels.map((label, i) => {
        const value = s.points[i]?.total ?? 0;
        return {
          x: xAt(i, n, layout, false),
          y: CHART.padTop + h - (value / max) * h,
          value,
          label,
        };
      });
      return {
        key: s.key,
        label: s.label,
        color,
        points,
        linePath: buildLinePath(points),
        areaPath: buildAreaPath(points, baseY),
        segments: directional ? buildSegments(points, TREND_COLORS) : [],
        areaSegments: directional && area ? buildAreaSegments(points, baseY, TREND_COLORS) : [],
      };
    });
  });

  // ------------------------------------------------------------------ //
  // Bars / stacked
  // ------------------------------------------------------------------ //
  readonly plottedBars = computed<ChartBar[]>(() => {
    const labels = this.labels();
    const { max } = this.yScale();
    const h = this.plotH();
    const baseY = this.baseY();
    const layout = this.layout();
    const n = labels.length || 1;
    const series = this.series();
    const stacked = this.isStacked();
    const single = series.length === 1 && !stacked;
    const groupW = layout.slot * CHART.barGroupRatio;
    const bars: ChartBar[] = [];

    labels.forEach((label, i) => {
      const center = xAt(i, n, layout, true);
      if (stacked) {
        let cursor = baseY;
        series.forEach((s, si) => {
          const value = s.points[i]?.total ?? 0;
          const barH = (value / max) * h;
          cursor -= barH;
          bars.push({
            x: center - groupW / 2,
            y: cursor,
            width: groupW,
            height: barH,
            color: s.color ?? CHART_PALETTE[si % CHART_PALETTE.length],
            value,
            label,
            seriesLabel: s.label,
          });
        });
      } else {
        const barW = groupW / series.length;
        series.forEach((s, si) => {
          const value = s.points[i]?.total ?? 0;
          const barH = (value / max) * h;
          let color = s.color ?? CHART_PALETTE[si % CHART_PALETTE.length];
          if (single) {
            const prev = i > 0 ? (s.points[i - 1]?.total ?? 0) : value;
            color =
              value > prev
                ? TREND_COLORS.up
                : value < prev
                  ? TREND_COLORS.down
                  : TREND_COLORS.flat;
          }
          bars.push({
            x: center - groupW / 2 + si * barW,
            y: baseY - barH,
            width: Math.max(2, barW - CHART.barGap),
            height: barH,
            color,
            value,
            label,
            seriesLabel: s.label,
          });
        });
      }
    });
    return bars;
  });

  // ------------------------------------------------------------------ //
  // Legend + hover
  // ------------------------------------------------------------------ //
  readonly legend = computed<LegendItem[]>(() =>
    this.series().map((s, i) => ({
      label: s.label,
      color: s.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
    })),
  );

  readonly hoverData = computed(() => {
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

  /** Highlighted vertices (one per series) at the hovered index. */
  readonly hoverPoints = computed(() => {
    const h = this.hover();
    if (!h || this.isBar()) {
      return [];
    }
    return this.plottedSeries()
      .map((s) => s.points[h.index])
      .filter((p): p is NonNullable<typeof p> => !!p);
  });

  onMove(event: MouseEvent, svg: SVGSVGElement): void {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * this.svgW();
    const index = indexAt(x, this.count(), this.layout(), this.isBar());
    this.hover.set({ index, x: xAt(index, this.count(), this.layout(), this.isBar()) });
  }

  clearHover(): void {
    this.hover.set(null);
  }

  /** Tooltip horizontal offset (px), clamped so it never overflows the plot. */
  tooltipLeft(x: number): number {
    const half = 90;
    return Math.min(this.svgW() - half, Math.max(half, x));
  }
}
