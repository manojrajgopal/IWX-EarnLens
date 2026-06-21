import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IncomeService } from '../../../core/services/income.service';
import { CategoryService } from '../../../core/services/category.service';
import { SourceService } from '../../../core/services/source.service';
import { TagService } from '../../../core/services/tag.service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogService } from '../../../shared/ui/dialog';
import { Category } from '../../../core/models/category.model';
import { Source } from '../../../core/models/source.model';
import { Tag } from '../../../core/models/tag.model';
import {
  Income,
  IncomePayload,
  RecurrenceType,
  ScopedUpdatePayload,
  UpdateScope,
} from '../../../core/models/income.model';
import {
  CURRENCY_OPTIONS,
  INCOME_TYPE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  RECURRENCE_OPTIONS,
  STATUS_OPTIONS,
} from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { positiveAmount, safeDayOfMonth } from '../engine/validators/income.validators';
import { isRecurring } from '../engine/config/recurrence-rules.config';
import { ScopeSelectorComponent } from '../components/scope-selector/scope-selector.component';
import { DangerBannerComponent } from '../components/danger-banner/danger-banner.component';
import { IncomeEditDraftService } from './services/income-edit-draft.service';

/**
 * Deliberately restricted edit experience. Unlike the friendly add page, this
 * screen signals danger through colour, locks most fields, demands a scope
 * choice for recurring income and gates the final write behind a
 * type-to-confirm step so historical records can never be changed by accident.
 */
@Component({
  selector: 'app-income-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
    ScopeSelectorComponent,
    DangerBannerComponent,
  ],
  templateUrl: './income-edit.component.html',
  styleUrl: './income-edit.component.css',
})
export class IncomeEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly incomeApi = inject(IncomeService);
  private readonly categoryApi = inject(CategoryService);
  private readonly sourceApi = inject(SourceService);
  private readonly tagApi = inject(TagService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(DialogService);
  private readonly draft = inject(IncomeEditDraftService);
  private readonly destroyRef = inject(DestroyRef);
  private saved = false;

  readonly typeOptions = INCOME_TYPE_OPTIONS;
  readonly recurrenceOptions = RECURRENCE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly paymentModeOptions = PAYMENT_MODE_OPTIONS;
  readonly currencyOptions = CURRENCY_OPTIONS;
  readonly dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly unlocked = signal(false);
  readonly income = signal<Income | null>(null);
  readonly scope = signal<UpdateScope | null>(null);
  readonly step = signal<'idle' | 'scope'>('idle');
  readonly categories = signal<Category[]>([]);
  readonly sources = signal<Source[]>([]);
  readonly tags = signal<Tag[]>([]);
  readonly selectedTags = signal<string[]>([]);

  /** A recurring income forces the scoped, high-restriction flow. */
  readonly isRecurringIncome = computed(() => {
    const inc = this.income();
    return !!inc && isRecurring(inc.recurrence as RecurrenceType);
  });

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, positiveAmount()]],
    status: ['received', [Validators.required]],
    payment_date: ['', [Validators.required]],
    payment_time: [''],
    day_of_month: [1 as number | null, [safeDayOfMonth()]],
    category_id: [''],
    source_id: [''],
    payment_mode: [''],
    client: [''],
    employer: [''],
    platform: [''],
    project_name: [''],
    reference_number: [''],
    notes: [''],
    is_taxable: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/app/income']);
      return;
    }
    forkJoin({
      income: this.incomeApi.get(id),
      categories: this.categoryApi.list(),
      sources: this.sourceApi.list(),
      tags: this.tagApi.list(),
    }).subscribe({
      next: ({ income, categories, sources, tags }) => {
        this.categories.set(categories);
        this.sources.set(sources);
        this.tags.set(tags);
        this.income.set(income);
        this.selectedTags.set(income.tag_ids ?? []);
        this.patchForm(income);
        this.restoreDraft(income.id);
        this.form.disable();
        if (this.unlocked()) {
          this.form.enable();
          this.form.controls.title.disable();
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Income not found.');
        this.router.navigate(['/app/income']);
      },
    });

    this.destroyRef.onDestroy(() => {
      if (!this.saved && this.unlocked()) {
        const inc = this.income();
        if (inc) {
          this.draft.save({
            incomeId: inc.id,
            formValue: this.form.getRawValue(),
            selectedTags: this.selectedTags(),
            unlocked: true,
          });
        }
      }
    });
  }

  private restoreDraft(incomeId: string): void {
    const d = this.draft.load();
    if (!d || d.incomeId !== incomeId) return;
    this.form.patchValue(d.formValue);
    this.selectedTags.set(d.selectedTags ?? []);
    if (d.unlocked) {
      this.unlocked.set(true);
    }
    this.draft.clear();
  }

  private patchForm(income: Income): void {
    this.form.patchValue({
      title: income.title,
      amount: income.amount,
      status: income.status,
      payment_date: income.payment_date?.slice(0, 10),
      payment_time: income.payment_time ?? '',
      day_of_month: income.day_of_month ?? 1,
      category_id: income.category_id ?? '',
      source_id: income.source_id ?? '',
      payment_mode: income.payment_mode ?? '',
      client: income.client ?? '',
      employer: income.employer ?? '',
      platform: income.platform ?? '',
      project_name: income.project_name ?? '',
      reference_number: income.reference_number ?? '',
      notes: income.notes ?? '',
      is_taxable: income.is_taxable,
    });
  }

  /** First gate: the user must explicitly unlock editing. */
  unlock(): void {
    this.unlocked.set(true);
    this.form.enable();
    // Keep identifying fields locked even after unlock.
    this.form.controls.title.disable();
  }

  relock(): void {
    this.unlocked.set(false);
    this.form.disable();
    this.form.reset();
    const inc = this.income();
    if (inc) {
      this.selectedTags.set(inc.tag_ids ?? []);
      this.patchForm(inc);
    }
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Begin the save flow — branch into scope choice or direct confirm. */
  async beginSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isRecurringIncome()) {
      this.scope.set(null);
      this.step.set('scope');
    } else {
      await this.showConfirmDialog();
    }
  }

  chooseScope(value: UpdateScope): void {
    this.scope.set(value);
  }

  async proceedFromScope(): Promise<void> {
    if (!this.scope()) {
      this.toast.error('Choose which occurrences to update first.');
      return;
    }
    await this.showConfirmDialog();
  }

  cancelFlow(): void {
    this.step.set('idle');
    this.scope.set(null);
  }

  /** Show the cinematic confirm dialog and commit if accepted. */
  private async showConfirmDialog(): Promise<void> {
    const gate = this.requireTextGate();
    const ok = await this.dialog.confirm({
      variant: gate ? 'danger' : this.isRecurringIncome() ? 'warning' : 'update',
      title: 'Confirm this change',
      message: this.confirmMessage(),
      icon: gate ? '⚠' : undefined,
      requireText: gate ?? undefined,
      confirmLabel: 'Apply change',
      cancelLabel: 'Go back',
    });
    if (!ok) return;
    this.commit();
  }

  /** Final write — uses scoped update for recurring, plain patch otherwise. */
  commit(): void {
    const inc = this.income();
    if (!inc) return;
    this.step.set('idle');
    this.saving.set(true);
    this.saved = true;
    this.draft.clear();

    const raw = this.form.getRawValue();
    const changes: Partial<IncomePayload> = {
      amount: raw.amount,
      status: raw.status as IncomePayload['status'],
      payment_date: raw.payment_date,
      payment_time: raw.payment_time || null,
      day_of_month: this.isRecurringIncome() ? raw.day_of_month : null,
      category_id: raw.category_id || null,
      source_id: raw.source_id || null,
      payment_mode: (raw.payment_mode || null) as IncomePayload['payment_mode'],
      client: raw.client || null,
      employer: raw.employer || null,
      platform: raw.platform || null,
      project_name: raw.project_name || null,
      reference_number: raw.reference_number || null,
      notes: raw.notes || null,
      is_taxable: raw.is_taxable,
      tag_ids: this.selectedTags(),
    };

    if (this.isRecurringIncome()) {
      const payload: ScopedUpdatePayload = { scope: this.scope() as UpdateScope, changes };
      this.incomeApi.updateScoped(inc.id, payload).subscribe({
        next: (res) => {
          this.toast.success(`Updated ${res.affected} occurrence(s).`);
          this.router.navigate(['/app/income']);
        },
        error: () => this.saving.set(false),
      });
    } else {
      this.incomeApi.update(inc.id, changes).subscribe({
        next: () => {
          this.toast.success('Income updated.');
          this.router.navigate(['/app/income']);
        },
        error: () => this.saving.set(false),
      });
    }
  }

  confirmMessage(): string {
    const raw = this.form.getRawValue();
    if (this.isRecurringIncome()) {
      const opt = this.scope();
      if (opt === 'all') {
        return 'You chose to rewrite EVERY occurrence including past, already-recorded income. This cannot be undone.';
      }
      return `Apply these changes using the "${opt}" scope? Past records outside this scope stay untouched.`;
    }
    return `Save changes to "${raw.title}" (amount ${raw.amount})?`;
  }

  /** The destructive "all" scope demands a typed confirmation. */
  requireTextGate(): string | null {
    return this.isRecurringIncome() && this.scope() === 'all' ? 'OVERWRITE' : null;
  }

  toggleTag(id: string): void {
    this.selectedTags.update((tags) =>
      tags.includes(id) ? tags.filter((t) => t !== id) : [...tags, id],
    );
  }
}
