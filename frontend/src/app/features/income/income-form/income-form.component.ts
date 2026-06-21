import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IncomeService } from '../../../core/services/income.service';
import { CategoryService } from '../../../core/services/category.service';
import { SourceService } from '../../../core/services/source.service';
import { TagService } from '../../../core/services/tag.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { Source } from '../../../core/models/source.model';
import { Tag } from '../../../core/models/tag.model';
import {
  IncomePayload,
  IncomeType,
  RecurrenceType,
} from '../../../core/models/income.model';
import {
  CURRENCY_OPTIONS,
  INCOME_TYPE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  RECURRENCE_OPTIONS,
  STATUS_OPTIONS,
} from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { FieldVisibilityService } from '../engine/services/field-visibility.service';
import { FieldContext } from '../engine/models/form-field.model';
import {
  positiveAmount,
  dateRange,
  recurringRequiresStart,
  safeDayOfMonth,
} from '../engine/validators/income.validators';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { RecurrencePreviewComponent } from '../components/recurrence-preview/recurrence-preview.component';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
    ConfirmDialogComponent,
    RecurrencePreviewComponent,
  ],
  templateUrl: './income-form.component.html',
})
export class IncomeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly incomeApi = inject(IncomeService);
  private readonly categoryApi = inject(CategoryService);
  private readonly sourceApi = inject(SourceService);
  private readonly tagApi = inject(TagService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly visibility = inject(FieldVisibilityService);

  readonly typeOptions = INCOME_TYPE_OPTIONS;
  readonly recurrenceOptions = RECURRENCE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly paymentModeOptions = PAYMENT_MODE_OPTIONS;
  readonly currencyOptions = CURRENCY_OPTIONS;
  readonly dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly sources = signal<Source[]>([]);
  readonly tags = signal<Tag[]>([]);
  readonly selectedTags = signal<string[]>([]);
  readonly showConfirm = signal(false);

  /** Live form drivers for the dynamic visibility engine. */
  readonly incomeType = signal<IncomeType>('salary');
  readonly recurrence = signal<RecurrenceType>('one_time');
  readonly autoAdd = signal(false);

  private readonly fieldCtx = computed<FieldContext>(() => ({
    incomeType: this.incomeType(),
    recurrence: this.recurrence(),
  }));

  readonly canAutomate = computed(() => this.visibility.canAutomate(this.fieldCtx()));

  readonly form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(2)]],
      amount: [0, [Validators.required, positiveAmount()]],
      currency: [this.auth.currentUser()?.default_currency ?? 'INR', [Validators.required]],
      income_type: ['salary', [Validators.required]],
      recurrence: ['one_time', [Validators.required]],
      status: ['received', [Validators.required]],
      payment_date: [this.today(), [Validators.required]],
      payment_time: [''],
      start_date: [''],
      end_date: [''],
      day_of_month: [1 as number | null, [safeDayOfMonth()]],
      auto_add: [false],
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
    },
    {
      validators: [
        dateRange('start_date', 'end_date'),
        recurringRequiresStart('recurrence', 'auto_add', 'start_date'),
      ],
    },
  );

  ngOnInit(): void {
    this.form.controls.income_type.valueChanges.subscribe((value) =>
      this.incomeType.set(value as IncomeType),
    );
    this.form.controls.recurrence.valueChanges.subscribe((value) =>
      this.recurrence.set(value as RecurrenceType),
    );
    this.form.controls.auto_add.valueChanges.subscribe((value) => this.autoAdd.set(!!value));

    forkJoin({
      categories: this.categoryApi.list(),
      sources: this.sourceApi.list(),
      tags: this.tagApi.list(),
    }).subscribe(({ categories, sources, tags }) => {
      this.categories.set(categories);
      this.sources.set(sources);
      this.tags.set(tags);
      this.loading.set(false);
    });
  }

  /** Whether a field key should render for the current type + recurrence. */
  isVisible(key: string): boolean {
    return this.visibility.isVisible(key, this.fieldCtx());
  }

  toggleTag(id: string): void {
    this.selectedTags.update((tags) =>
      tags.includes(id) ? tags.filter((t) => t !== id) : [...tags, id],
    );
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Step 1 — validate then open the confirmation modal. */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.showConfirm.set(true);
  }

  cancelConfirm(): void {
    this.showConfirm.set(false);
  }

  /** Step 2 — the user confirmed: persist the income. */
  confirmSave(): void {
    this.showConfirm.set(false);
    const raw = this.form.getRawValue();
    const recurs = raw.recurrence !== 'one_time';
    const payload: IncomePayload = {
      title: raw.title,
      amount: raw.amount,
      currency: raw.currency,
      income_type: raw.income_type as IncomePayload['income_type'],
      recurrence: raw.recurrence as IncomePayload['recurrence'],
      status: raw.status as IncomePayload['status'],
      payment_date: raw.payment_date,
      payment_time: this.isVisible('payment_time') ? raw.payment_time || null : null,
      start_date: recurs ? raw.start_date || null : null,
      end_date: recurs ? raw.end_date || null : null,
      day_of_month: recurs && this.isVisible('day_of_month') ? raw.day_of_month : null,
      auto_add: this.canAutomate() ? !!raw.auto_add : false,
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

    this.saving.set(true);
    this.incomeApi.create(payload).subscribe({
      next: () => {
        this.toast.success(
          payload.auto_add
            ? 'Income added — automation enabled. EarnLens will record it for you.'
            : 'Income added.',
        );
        this.router.navigate(['/app/income']);
      },
      error: () => this.saving.set(false),
    });
  }

  confirmMessage(): string {
    const raw = this.form.getRawValue();
    if (this.canAutomate() && raw.auto_add) {
      return `You are about to create an automated ${raw.recurrence} income of ${raw.currency} ${raw.amount}. EarnLens will record this for you every cycle without manual entry.`;
    }
    return `Add "${raw.title}" for ${raw.currency} ${raw.amount}?`;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
