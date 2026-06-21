import { Component, computed, input, output, signal } from '@angular/core';

export type ConfirmTone = 'primary' | 'caution' | 'danger';

/**
 * A focused confirmation modal. Used to gate income saves and — in its
 * `danger` tone — the destructive recurring-salary edits.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="cd-overlay" (click)="onBackdrop()">
      <div
        class="cd-panel"
        [class.cd-panel--caution]="tone() === 'caution'"
        [class.cd-panel--danger]="tone() === 'danger'"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
      >
        <div class="cd-icon">{{ icon() }}</div>
        <h2 class="cd-title">{{ title() }}</h2>
        <p class="cd-message">{{ message() }}</p>

        <ng-content />

        @if (requireText()) {
          <div class="cd-gate">
            <label class="cd-gate-label">
              Type <strong>{{ requireText() }}</strong> to continue
            </label>
            <input
              class="cd-gate-input"
              [value]="typed()"
              (input)="onType($event)"
              [placeholder]="requireText() || ''"
              autocomplete="off"
            />
          </div>
        }

        <div class="cd-actions">
          <button type="button" class="cd-btn cd-btn--ghost" (click)="cancelled.emit()">
            {{ cancelLabel() }}
          </button>
          <button
            type="button"
            class="cd-btn"
            [class.cd-btn--primary]="tone() === 'primary'"
            [class.cd-btn--caution]="tone() === 'caution'"
            [class.cd-btn--danger]="tone() === 'danger'"
            [disabled]="!canConfirm()"
            (click)="confirmed.emit()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  readonly title = input('Are you sure?');
  readonly message = input('');
  readonly icon = input('?');
  readonly tone = input<ConfirmTone>('primary');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  /** When set, the user must type this exact text to enable confirm. */
  readonly requireText = input<string | null>(null);
  readonly dismissOnBackdrop = input(true);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly typed = signal('');

  protected readonly canConfirm = computed(() => {
    const gate = this.requireText();
    if (!gate) return true;
    return this.typed().trim().toUpperCase() === gate.trim().toUpperCase();
  });

  protected onType(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  protected onBackdrop(): void {
    if (this.dismissOnBackdrop()) {
      this.cancelled.emit();
    }
  }
}
