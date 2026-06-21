import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';
import { IncomeService } from '../../core/services/income.service';
import { CURRENCY_SYMBOLS } from '../../core/constants/app.constants';
import { DashboardSummary, GraphSeries } from '../../core/models/analytics.model';
import { Income } from '../../core/models/income.model';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { HumanizePipe } from '../../shared/pipes/humanize.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    ChartComponent,
    SpinnerComponent,
    EmptyStateComponent,
    MoneyPipe,
    HumanizePipe,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly incomeApi = inject(IncomeService);

  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly recent = signal<Income[]>([]);

  readonly currency = computed(() => this.summary()?.currency || 'INR');
  readonly currencySymbol = computed(() => CURRENCY_SYMBOLS[this.currency()] || '₹');

  readonly chartLabels = computed(() => (this.summary()?.trend ?? []).map((p) => p.label));
  readonly chartSeries = computed<GraphSeries[]>(() => {
    const trend = this.summary()?.trend ?? [];
    return [{ key: 'total', label: 'Income', points: trend }];
  });

  ngOnInit(): void {
    this.analytics.dashboard({}).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.incomeApi.recent(6).subscribe((items) => this.recent.set(items));
  }
}
