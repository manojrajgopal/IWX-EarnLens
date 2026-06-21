import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IncomeService } from '../../../core/services/income.service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogService } from '../../../shared/ui/dialog';
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
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(DialogService);

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
    payment_mode: [''],
    notes: [''],
    is_taxable: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/app/income']);
      return;
    }
    this.incomeApi.get(id).subscribe({
      next: (income) => {
        this.income.set(income);
        this.form.patchValue({
          title: income.title,
          amount: income.amount,
          status: income.status,
          payment_date: income.payment_date?.slice(0, 10),
          payment_time: income.payment_time ?? '',
          day_of_month: income.day_of_month ?? 1,
          payment_mode: income.payment_mode ?? '',
          notes: income.notes ?? '',
          is_taxable: income.is_taxable,
        });
        this.form.disable();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Income not found.');
        this.router.navigate(['/app/income']);
      },
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
      this.form.patchValue({
        title: inc.title,
        amount: inc.amount,
        status: inc.status,
        payment_date: inc.payment_date?.slice(0, 10),
        payment_time: inc.payment_time ?? '',
        day_of_month: inc.day_of_month ?? 1,
        payment_mode: inc.payment_mode ?? '',
        notes: inc.notes ?? '',
        is_taxable: inc.is_taxable,
      });
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

    const raw = this.form.getRawValue();
    const changes: Partial<IncomePayload> = {
      amount: raw.amount,
      status: raw.status as IncomePayload['status'],
      payment_date: raw.payment_date,
      payment_time: raw.payment_time || null,
      day_of_month: this.isRecurringIncome() ? raw.day_of_month : null,
      payment_mode: (raw.payment_mode || null) as IncomePayload['payment_mode'],
      notes: raw.notes || null,
      is_taxable: raw.is_taxable,
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
}
