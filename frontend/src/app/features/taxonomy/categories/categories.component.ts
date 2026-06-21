import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category, CategoryPayload } from '../../../core/models/category.model';
import { CHART_PALETTE } from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconPickerComponent, IconDisplayComponent } from '../../../shared/components/icon-picker';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, EmptyStateComponent, IconPickerComponent, IconDisplayComponent],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  private readonly api = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly palette = CHART_PALETTE;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly items = signal<Category[]>([]);
  readonly editId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    color: [CHART_PALETTE[0], [Validators.required]],
    icon: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  edit(item: Category): void {
    this.editId.set(item.id);
    this.form.patchValue({
      name: item.name,
      description: item.description ?? '',
      color: item.color,
      icon: item.icon ?? '',
    });
  }

  cancel(): void {
    this.editId.set(null);
    this.form.reset({ name: '', description: '', color: CHART_PALETTE[0], icon: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue() as CategoryPayload;
    const id = this.editId();
    const request = id ? this.api.update(id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Category updated.' : 'Category created.');
        this.cancel();
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  remove(item: Category): void {
    if (!confirm(`Delete category "${item.name}"?`)) {
      return;
    }
    this.api.remove(item.id).subscribe(() => {
      this.toast.success('Category deleted.');
      this.load();
    });
  }
}
