import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TagService } from '../../../core/services/tag.service';
import { ToastService } from '../../../core/services/toast.service';
import { Tag, TagPayload } from '../../../core/models/tag.model';
import { CHART_PALETTE } from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, EmptyStateComponent],
  templateUrl: './tags.component.html',
})
export class TagsComponent implements OnInit {
  private readonly api = inject(TagService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly palette = CHART_PALETTE;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly items = signal<Tag[]>([]);
  readonly editId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    color: [CHART_PALETTE[3], [Validators.required]],
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

  edit(item: Tag): void {
    this.editId.set(item.id);
    this.form.patchValue({ name: item.name, color: item.color });
  }

  cancel(): void {
    this.editId.set(null);
    this.form.reset({ name: '', color: CHART_PALETTE[3] });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue() as TagPayload;
    const id = this.editId();
    const request = id ? this.api.update(id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Tag updated.' : 'Tag created.');
        this.cancel();
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  remove(item: Tag): void {
    if (!confirm(`Delete tag "${item.name}"?`)) {
      return;
    }
    this.api.remove(item.id).subscribe(() => {
      this.toast.success('Tag deleted.');
      this.load();
    });
  }
}
