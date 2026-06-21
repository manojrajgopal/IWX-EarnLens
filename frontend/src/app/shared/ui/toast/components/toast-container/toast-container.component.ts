import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast.service';
import { ToastItemComponent } from '../toast-item/toast-item.component';

/**
 * Fixed top-right stack of cinematic toasts. Newest appears on top.
 * Removal is delegated to each item (after its exit animation).
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [ToastItemComponent],
  template: `
    <div class="ct-stack" aria-live="polite" aria-atomic="false">
      @for (toast of toasts.toasts(); track toast.id) {
        <app-toast-item [toast]="toast" (dismissed)="toasts.dismiss($event)" />
      }
    </div>
  `,
  styles: [`
    .ct-stack {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      width: min(92vw, 380px);
      pointer-events: none;
    }
    .ct-stack > * {
      pointer-events: auto;
    }
    @media (max-width: 480px) {
      .ct-stack {
        top: 0.75rem;
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
      }
    }
  `],
})
export class ToastContainerComponent {
  readonly toasts = inject(ToastService);
}
