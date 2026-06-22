import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { PdfReportFacade, ReportOptions } from './pdf';

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
  private readonly pdf = inject(PdfReportFacade);
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
    this.api.generate(this.filters()).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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

  /** Fetch data for the chosen range, then render the PDF. */
  onDialogConfirm(result: ReportDialogResult): void {
    this.dialogOpen.set(false);
    this.exporting.set(true);
    const filters: IncomeFilters = {
      start_date: result.options.startDate || null,
      end_date: result.options.endDate || null,
    };
    this.api.generate(filters).subscribe({
      next: (report) => {
        this.report.set(report);
        try {
          if (result.action === 'preview') {
            this.pdf.preview(report, result.options);
          } else {
            this.pdf.download(report, result.options);
            this.toast.success('Cinematic PDF generated.');
          }
        } catch {
          this.toast.error('Could not render the PDF.');
        }
        this.exporting.set(false);
      },
      error: () => {
        this.exporting.set(false);
        this.toast.error('Could not load report data.');
      },
    });
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
