import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { IncomeReport } from '../../core/models/report.model';
import { IncomeFilters } from '../../core/models/income.model';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { HumanizePipe } from '../../shared/pipes/humanize.pipe';

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
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  private readonly api = inject(ReportService);
  private readonly location = inject(Location);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly downloading = signal(false);
  readonly report = signal<IncomeReport | null>(null);
  readonly startDate = signal('');
  readonly endDate = signal('');

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

  download(): void {
    this.downloading.set(true);
    this.api.exportCsv(this.filters()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `earnlens-report-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
        this.toast.success('CSV downloaded.');
      },
      error: () => this.downloading.set(false),
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
