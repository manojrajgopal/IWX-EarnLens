import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncomeService } from '../../../core/services/income.service';
import { CategoryService } from '../../../core/services/category.service';
import { SourceService } from '../../../core/services/source.service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogService } from '../../../shared/ui/dialog';
import { Income, IncomeFilters } from '../../../core/models/income.model';
import { Category } from '../../../core/models/category.model';
import { Source } from '../../../core/models/source.model';
import { PaginationMeta } from '../../../core/models/api.model';
import {
  INCOME_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { HumanizePipe } from '../../../shared/pipes/humanize.pipe';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SpinnerComponent,
    EmptyStateComponent,
    PaginationComponent,
    MoneyPipe,
    HumanizePipe,
  ],
  templateUrl: './income-list.component.html',
})
export class IncomeListComponent implements OnInit {
  private readonly incomeApi = inject(IncomeService);
  private readonly categoryApi = inject(CategoryService);
  private readonly sourceApi = inject(SourceService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly typeOptions = INCOME_TYPE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly loading = signal(true);
  readonly incomes = signal<Income[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly sources = signal<Source[]>([]);
  readonly page = signal(1);

  readonly filters = signal<IncomeFilters>({});

  readonly categoryMap = computed(() => {
    const map = new Map<string, Category>();
    this.categories().forEach((c) => map.set(c.id, c));
    return map;
  });

  ngOnInit(): void {
    this.categoryApi.list().subscribe((c) => this.categories.set(c));
    this.sourceApi.list().subscribe((s) => this.sources.set(s));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.incomeApi.list({ ...this.filters(), top_level: true }, this.page(), 12).subscribe({
      next: (res) => {
        this.incomes.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  update<K extends keyof IncomeFilters>(key: K, value: IncomeFilters[K]): void {
    this.filters.update((f) => ({ ...f, [key]: value || null }));
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  resetFilters(): void {
    this.filters.set({});
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  async remove(income: Income): Promise<void> {
    const ok = await this.dialog.confirm({
      variant: 'danger',
      title: 'Delete income?',
      message: 'This entry will be permanently deleted',
      highlight: income.title,
      note: 'This action cannot be undone.',
      confirmLabel: 'Delete income',
    });
    if (!ok) {
      return;
    }
    this.incomeApi.remove(income.id).subscribe(() => {
      this.toast.success('Income deleted.');
      this.load();
    });
  }

  categoryName(id?: string | null): string {
    return (id && this.categoryMap().get(id)?.name) || '—';
  }
}
