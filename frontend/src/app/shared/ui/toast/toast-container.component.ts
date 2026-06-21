import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-[min(92vw,360px)]">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="card card-pad flex items-start gap-3 animate-in"
          [class.toast-success]="toast.kind === 'success'"
          [class.toast-error]="toast.kind === 'error'"
        >
          <span class="mt-0.5 text-lg leading-none">
            @if (toast.kind === 'success') { ✓ } @else if (toast.kind === 'error') { ⚠ } @else { ℹ }
          </span>
          <p class="text-sm flex-1 leading-snug">{{ toast.message }}</p>
          <button class="text-muted hover:text-[var(--text-primary)]" (click)="toasts.dismiss(toast.id)">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-success {
        border-left: 3px solid var(--positive);
      }
      .toast-error {
        border-left: 3px solid var(--negative);
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly toasts = inject(ToastService);
}
