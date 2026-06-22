import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';
import { IncomeService } from '../../core/services/income.service';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { CURRENCY_SYMBOLS } from '../../core/constants/app.constants';
import { DashboardSummary, GraphSeries } from '../../core/models/analytics.model';
import { Income } from '../../core/models/income.model';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { HumanizePipe } from '../../shared/pipes/humanize.pipe';

interface QuickLink {
  label: string;
  path: string;
  icon: string;
  description: string;
  accent: string;
}

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
  private readonly reports = inject(ReportService);
  private readonly toast = inject(ToastService);
  private readonly location = inject(Location);

  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly exporting = signal(false);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly recent = signal<Income[]>([]);

  readonly currency = computed(() => this.summary()?.currency || 'INR');
  readonly currencySymbol = computed(() => CURRENCY_SYMBOLS[this.currency()] || '₹');

  readonly chartLabels = computed(() => (this.summary()?.trend ?? []).map((p) => p.label));
  readonly chartSeries = computed<GraphSeries[]>(() => {
    const trend = this.summary()?.trend ?? [];
    return [{ key: 'total', label: 'Income', points: trend }];
  });

  /** Share of income that is recurring (0–100). */
  readonly recurringShare = computed(() => {
    const r = this.summary()?.recurring;
    if (!r) return 0;
    const total = r.recurring_total + r.one_time_total;
    return total > 0 ? Math.round((r.recurring_total / total) * 100) : 0;
  });

  /** Navigation tiles — every section of the app, one click away. */
  readonly quickLinks: QuickLink[] = [
    { label: 'Add Income', path: '/app/income/new', icon: '＋', description: 'Record a new entry', accent: '#6366f1' },
    { label: 'All Income', path: '/app/income', icon: '＄', description: 'Browse & filter entries', accent: '#10b981' },
    { label: 'Analytics', path: '/app/analytics', icon: '◴', description: 'Charts & deep trends', accent: '#0ea5e9' },
    { label: 'Reports', path: '/app/reports', icon: '▤', description: 'Summaries & exports', accent: '#f59e0b' },
    { label: 'Categories', path: '/app/categories', icon: '⬡', description: 'Group income buckets', accent: '#8b5cf6' },
    { label: 'Sources', path: '/app/sources', icon: '⌖', description: 'Where income comes from', accent: '#ec4899' },
    { label: 'Tags', path: '/app/tags', icon: '#', description: 'Flexible labels', accent: '#14b8a6' },
    { label: 'Activity', path: '/app/activity', icon: '↻', description: 'Recent account actions', accent: '#f43f5e' },
    { label: 'Currency', path: '/app/currency', icon: '⇄', description: 'Rates & conversion', accent: '#eab308' },
    { label: 'Profile', path: '/app/profile', icon: '☺', description: 'Your info & password', accent: '#3b82f6' },
    { label: 'Settings', path: '/app/settings', icon: '⚙', description: 'Preferences & defaults', accent: '#64748b' },
    { label: 'Welcome', path: '/app/welcome', icon: '✦', description: 'Guided home & tour', accent: '#a855f7' },
  ];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.analytics.dashboard({}).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
        this.refreshing.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.refreshing.set(false);
      },
    });
    this.incomeApi.recent(8).subscribe((items) => this.recent.set(items));
  }

  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.load();
  }

  /** Download all income as a CSV via the report service. */
  exportCsv(): void {
    if (this.exporting()) return;
    this.exporting.set(true);
    this.reports.exportCsv({}).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `earnlens-income-${this.todayStamp()}.csv`);
        this.toast.success('CSV exported.');
        this.exporting.set(false);
      },
      error: () => {
        this.toast.error('Could not export CSV.');
        this.exporting.set(false);
      },
    });
  }

  private todayStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }

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

  goBack(): void {
    this.location.back();
  }
}
