import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout, TimeoutError } from 'rxjs';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { IncomeReport } from '../../core/models/report.model';
import { GraphSeries } from '../../core/models/analytics.model';
import { IncomeFilters } from '../../core/models/income.model';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { HumanizePipe } from '../../shared/pipes/humanize.pipe';
import { ReportOptionsDialogComponent, ReportDialogResult } from './dialog';
import { ReportOptions } from './pdf';

/** Hard ceiling for report generation — surface an error instead of hanging. */
const REPORT_TIMEOUT_MS = 30_000;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartComponent,
    SpinnerComponent,
    EmptyStateComponent,
    MoneyPipe,
    HumanizePipe,
    ReportOptionsDialogComponent,
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  private readonly api = inject(ReportService);
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly report = signal<IncomeReport | null>(null);
  readonly startDate = signal('');
  readonly endDate = signal('');

  readonly dialogOpen = signal(false);
  readonly dialogInitial = signal<Partial<ReportOptions>>({});

  /**
   * Memoized chart inputs. These MUST be stable references — binding fresh
   * arrays on every change-detection pass makes the chart's reactive effect
   * churn microtasks and freezes the zone.
   */
  readonly trendLabels = computed(() => this.report()?.trend.map((p) => p.label) ?? []);
  readonly trendSeries = computed<GraphSeries[]>(() => {
    const r = this.report();
    if (!r) {
      return [];
    }
    return [{ key: 'total', label: 'Income', points: r.trend }];
  });

  private filters(): IncomeFilters {
    return {
      start_date: this.startDate() || null,
      end_date: this.endDate() || null,
    };
  }

  /** Load a default (all-time) report on entry so the graph shows immediately. */
  ngOnInit(): void {
    this.generate();
  }

  generate(): void {
    this.loading.set(true);
    this.api
      .generate(this.filters())
      .pipe(timeout(REPORT_TIMEOUT_MS))
      .subscribe({
        next: (report) => {
          this.report.set(report);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(
            err instanceof TimeoutError
              ? 'The report took too long to generate. Please try again.'
              : 'Could not load report data.',
          );
        },
      });
  }

  /** Open the export console, pre-filled with auto-generated context. */
  openExport(): void {
    const user = this.auth.currentUser();
    const today = new Date();
    const start = this.startDate() || `${today.getFullYear()}-01-01`;
    const end = this.endDate() || this.toIsoDate(today);
    this.dialogInitial.set({
      title: 'Income Intelligence Report',
      subtitle: this.buildSubtitle(start, end),
      preparedFor: user?.full_name || user?.username || '',
      startDate: start,
      endDate: end,
      fileName: `earnlens-report-${this.toIsoDate(today)}`,
    });
    this.dialogOpen.set(true);
  }

  /** Format a Date as an ISO `yyyy-mm-dd` string (local). */
  private toIsoDate(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  /** Build a human-friendly subtitle from the selected coverage range. */
  private buildSubtitle(start: string | null, end: string | null): string {
    const fmt = (value: string): string =>
      new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    if (start && end) {
      return `Earnings overview · ${fmt(start)} – ${fmt(end)}`;
    }
    if (start) {
      return `Earnings from ${fmt(start)}`;
    }
    if (end) {
      return `Earnings up to ${fmt(end)}`;
    }
    return 'A clear overview of your earnings';
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  /** Generate the cinematic PDF server-side, then download or preview it. */
  onDialogConfirm(result: ReportDialogResult): void {
    this.dialogOpen.set(false);
    this.exporting.set(true);
    this.api
      .exportPdf(result.options as unknown as Record<string, unknown>)
      .pipe(timeout(REPORT_TIMEOUT_MS))
      .subscribe({
        next: (blob) => {
          this.exporting.set(false);
          const fileName = `${result.options.fileName || 'earnlens-report'}.pdf`;
          if (result.action === 'preview') {
            this.previewBlob(blob);
          } else {
            this.downloadBlob(blob, fileName);
            this.toast.success('Report PDF generated.');
          }
        },
        error: (err) => {
          this.exporting.set(false);
          this.toast.error(
            err instanceof TimeoutError
              ? 'The report took too long to generate. Please try again.'
              : 'Could not generate the PDF.',
          );
        },
      });
  }

  /** Trigger a browser download for the generated PDF blob. */
  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  /** Open the generated PDF blob in a new tab for preview. */
  private previewBlob(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  goBack(): void {
    this.location.back();
  }
}
