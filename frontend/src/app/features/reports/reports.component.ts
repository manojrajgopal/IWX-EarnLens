import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout, TimeoutError } from 'rxjs';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { IncomeReport } from '../../core/models/report.model';
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
export class ReportsComponent {
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

  private filters(): IncomeFilters {
    return {
      start_date: this.startDate() || null,
      end_date: this.endDate() || null,
    };
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

  /** Open the cinematic options console, pre-filled with context. */
  openExport(): void {
    const user = this.auth.currentUser();
    this.dialogInitial.set({
      preparedFor: user?.full_name || user?.username || '',
      startDate: this.startDate() || null,
      endDate: this.endDate() || null,
      fileName: `earnlens-report-${new Date().toISOString().slice(0, 10)}`,
    });
    this.dialogOpen.set(true);
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
            this.toast.success('Cinematic PDF generated.');
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

  trendLabels(report: IncomeReport): string[] {
    return report.trend.map((p) => p.label);
  }

  trendSeries(report: IncomeReport) {
    return [{ key: 'total', label: 'Income', points: report.trend }];
  }

  goBack(): void {
    this.location.back();
  }
}
