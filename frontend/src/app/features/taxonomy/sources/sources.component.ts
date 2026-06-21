import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SourceService } from '../../../core/services/source.service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogService } from '../../../shared/ui/dialog';
import { Source, SourcePayload } from '../../../core/models/source.model';
import { CHART_PALETTE } from '../../../core/constants/app.constants';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconPickerComponent, IconDisplayComponent } from '../../../shared/components/icon-picker';

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, EmptyStateComponent, IconPickerComponent, IconDisplayComponent],
  templateUrl: './sources.component.html',
})
export class SourcesComponent implements OnInit {
  private readonly api = inject(SourceService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly palette = CHART_PALETTE;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly items = signal<Source[]>([]);
  readonly editId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    source_type: [''],
    website: [''],
    description: [''],
    color: [CHART_PALETTE[1], [Validators.required]],
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

  edit(item: Source): void {
    this.editId.set(item.id);
    this.form.patchValue({
      name: item.name,
      source_type: item.source_type ?? '',
      website: item.website ?? '',
      description: item.description ?? '',
      color: item.color,
      icon: item.icon ?? '',
    });
  }

  cancel(): void {
    this.editId.set(null);
    this.form.reset({
      name: '',
      source_type: '',
      website: '',
      description: '',
      color: CHART_PALETTE[1],
      icon: '',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue() as SourcePayload;
    const id = this.editId();
    const request = id ? this.api.update(id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Source updated.' : 'Source created.');
        this.cancel();
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  async remove(item: Source): Promise<void> {
    const ok = await this.dialog.confirm({
      variant: 'danger',
      title: 'Delete source?',
      message: 'This will permanently remove the source',
      highlight: item.name,
      confirmLabel: 'Delete source',
    });
    if (!ok) {
      return;
    }
    this.api.remove(item.id).subscribe(() => {
      this.toast.success('Source deleted.');
      this.load();
    });
  }
}
