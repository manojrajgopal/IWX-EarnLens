import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { IncomePayload } from '../../../core/models/income.model';
import {
  CURRENCY_OPTIONS,
  INCOME_TYPE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  RECURRENCE_OPTIONS,
  STATUS_OPTIONS,
} from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
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
  private readonly route = inject(ActivatedRoute);

  readonly typeOptions = INCOME_TYPE_OPTIONS;
  readonly recurrenceOptions = RECURRENCE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly paymentModeOptions = PAYMENT_MODE_OPTIONS;
  readonly currencyOptions = CURRENCY_OPTIONS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly sources = signal<Source[]>([]);
  readonly tags = signal<Tag[]>([]);
  readonly editId = signal<string | null>(null);
  readonly selectedTags = signal<string[]>([]);

  readonly isEdit = computed(() => this.editId() !== null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    currency: [this.auth.currentUser()?.default_currency ?? 'USD', [Validators.required]],
    income_type: ['salary', [Validators.required]],
    recurrence: ['one_time', [Validators.required]],
    status: ['received', [Validators.required]],
    payment_date: [this.today(), [Validators.required]],
    category_id: [''],
    source_id: [''],
    payment_mode: [''],
    client: [''],
    employer: [''],
    platform: [''],
    notes: [''],
    is_taxable: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    forkJoin({
      categories: this.categoryApi.list(),
      sources: this.sourceApi.list(),
      tags: this.tagApi.list(),
    }).subscribe(({ categories, sources, tags }) => {
      this.categories.set(categories);
      this.sources.set(sources);
      this.tags.set(tags);
      if (id) {
        this.editId.set(id);
        this.loadIncome(id);
      } else {
        this.loading.set(false);
      }
    });
  }

  private loadIncome(id: string): void {
    this.incomeApi.get(id).subscribe({
      next: (income) => {
        this.form.patchValue({
          title: income.title,
          amount: income.amount,
          currency: income.currency,
          income_type: income.income_type,
          recurrence: income.recurrence,
          status: income.status,
          payment_date: income.payment_date?.slice(0, 10),
          category_id: income.category_id ?? '',
          source_id: income.source_id ?? '',
          payment_mode: income.payment_mode ?? '',
          client: income.client ?? '',
          employer: income.employer ?? '',
          platform: income.platform ?? '',
          notes: income.notes ?? '',
          is_taxable: income.is_taxable,
        });
        this.selectedTags.set(income.tag_ids ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Income not found.');
        this.router.navigate(['/app/income']);
      },
    });
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: IncomePayload = {
      ...raw,
      category_id: raw.category_id || null,
      source_id: raw.source_id || null,
      payment_mode: (raw.payment_mode || null) as IncomePayload['payment_mode'],
      income_type: raw.income_type as IncomePayload['income_type'],
      recurrence: raw.recurrence as IncomePayload['recurrence'],
      status: raw.status as IncomePayload['status'],
      tag_ids: this.selectedTags(),
    };

    this.saving.set(true);
    const id = this.editId();
    const request = id
      ? this.incomeApi.update(id, payload)
      : this.incomeApi.create(payload);

    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Income updated.' : 'Income added.');
        this.router.navigate(['/app/income']);
      },
      error: () => this.saving.set(false),
    });
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
