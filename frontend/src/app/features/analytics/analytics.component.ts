import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import {
  ChartStyle,
  DistributionItem,
  GraphResponse,
  GroupBy,
  SplitBy,
} from '../../core/models/analytics.model';
import { IncomeFilters } from '../../core/models/income.model';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

interface SelectOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartComponent,
    SpinnerComponent,
    EmptyStateComponent,
    MoneyPipe,
  ],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly location = inject(Location);

  readonly loading = signal(true);
  readonly graph = signal<GraphResponse | null>(null);
  readonly distribution = signal<DistributionItem[]>([]);

  readonly groupBy = signal<GroupBy>('month');
  readonly splitBy = signal<SplitBy>(null);
  readonly chartStyle = signal<ChartStyle>('area');
  readonly distributionBy = signal<'category' | 'source' | 'type'>('category');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  readonly groupOptions: SelectOption<GroupBy>[] = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' },
  ];
  readonly splitOptions: SelectOption<SplitBy>[] = [
    { value: null, label: 'No split' },
    { value: 'income_type', label: 'By type' },
    { value: 'category_id', label: 'By category' },
    { value: 'source_id', label: 'By source' },
    { value: 'recurrence', label: 'By recurrence' },
  ];
  readonly styleOptions: SelectOption<ChartStyle>[] = [
    { value: 'area', label: 'Area' },
    { value: 'line', label: 'Line' },
    { value: 'bar', label: 'Bar' },
    { value: 'stacked', label: 'Stacked' },
  ];
  readonly distOptions: SelectOption<'category' | 'source' | 'type'>[] = [
    { value: 'category', label: 'Category' },
    { value: 'source', label: 'Source' },
    { value: 'type', label: 'Type' },
  ];

  readonly currency = computed(() => 'INR');

  ngOnInit(): void {
    this.reload();
  }

  private filters(): IncomeFilters {
    return {
      start_date: this.startDate() || null,
      end_date: this.endDate() || null,
    };
  }

  reload(): void {
    this.loading.set(true);
    this.analytics.graph(this.filters(), this.groupBy(), this.splitBy()).subscribe({
      next: (data) => {
        this.graph.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.loadDistribution();
  }

  loadDistribution(): void {
    this.analytics
      .distribution(this.filters(), this.distributionBy())
      .subscribe((items) => this.distribution.set(items));
  }

  setGroupBy(value: GroupBy): void {
    this.groupBy.set(value);
    this.reload();
  }

  setSplitBy(value: SplitBy): void {
    this.splitBy.set(value);
    this.reload();
  }

  setStyle(value: ChartStyle): void {
    this.chartStyle.set(value);
  }

  setDistribution(value: 'category' | 'source' | 'type'): void {
    this.distributionBy.set(value);
    this.loadDistribution();
  }

  applyDates(): void {
    this.reload();
  }

  clearFilters(): void {
    this.groupBy.set('month');
    this.splitBy.set(null);
    this.startDate.set('');
    this.endDate.set('');
    this.reload();
  }

  goBack(): void {
    this.location.back();
  }
}
