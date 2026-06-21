import { Component, OnInit, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { IncomeService } from '../../../core/services/income.service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogService } from '../../../shared/ui/dialog';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import {
  DetailActionsComponent,
  DetailHeroComponent,
  DetailSectionComponent,
  OccurrenceListComponent,
  ParentLinkComponent,
  SeriesSummaryComponent,
} from './components';
import { IncomeDetailFacade } from './services/income-detail.facade';
import { isOccurrence } from './utils/income-classify.util';

/**
 * Detailed view of a single income. Reused recursively across the
 * grandparent → parent → child hierarchy: every occurrence links back to this
 * same page, so drilling into a series feels like one consistent surface.
 */
@Component({
  selector: 'app-income-detail',
  standalone: true,
  imports: [
    SpinnerComponent,
    EmptyStateComponent,
    DetailHeroComponent,
    DetailSectionComponent,
    SeriesSummaryComponent,
    OccurrenceListComponent,
    ParentLinkComponent,
    DetailActionsComponent,
  ],
  providers: [IncomeDetailFacade],
  templateUrl: './income-detail.component.html',
  styleUrl: './income-detail.component.css',
})
export class IncomeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly incomeApi = inject(IncomeService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly facade = inject(IncomeDetailFacade);

  /** Parent template id shown by the "back to series" banner. */
  readonly parentId = computed(() => {
    const income = this.facade.income();
    return income && isOccurrence(income) ? income.recurring_parent_id ?? null : null;
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) this.facade.load(id);
    });
  }

  onOccurrencePage(page: number): void {
    const id = this.facade.income()?.id;
    if (id) this.facade.loadOccurrences(id, page);
  }

  async remove(): Promise<void> {
    const income = this.facade.income();
    if (!income) return;
    const ok = await this.dialog.confirm({
      variant: 'danger',
      title: 'Delete income?',
      message: 'This entry will be permanently deleted',
      highlight: income.title,
      note: 'This action cannot be undone.',
      confirmLabel: 'Delete income',
    });
    if (!ok) return;
    this.incomeApi.remove(income.id).subscribe(() => {
      this.toast.success('Income deleted.');
      this.router.navigate(['/app/income']);
    });
  }
}
