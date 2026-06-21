import { Component, input, output } from '@angular/core';
import { DialogButton } from '../../models/dialog.model';

/**
 * Flexible action row. Renders any number of buttons with per-button
 * style (solid / ghost / outline) and tone (neutral / primary / danger…).
 * Buttons can be individually gated (disabled) — e.g. behind a
 * type-to-confirm input.
 */
@Component({
  selector: 'app-dialog-actions',
  standalone: true,
  template: `
    <div class="da" [class.da--single]="buttons().length === 1">
      @for (btn of buttons(); track btn.id; let i = $index) {
        <button
          type="button"
          class="da__btn"
          [class.da__btn--solid]="(btn.style ?? 'solid') === 'solid'"
          [class.da__btn--ghost]="btn.style === 'ghost'"
          [class.da__btn--outline]="btn.style === 'outline'"
          [attr.data-tone]="btn.tone ?? 'primary'"
          [style.--accent]="accent()"
          [style.animation-delay]="(0.18 + i * 0.06) + 's'"
          [disabled]="btn.gated && !gateMet()"
          (click)="choose.emit(btn)"
        >
          @if (btn.icon) {
            <span class="da__btn-icon">{{ btn.icon }}</span>
          }
          <span>{{ btn.label }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './dialog-actions.component.css',
})
export class DialogActionsComponent {
  readonly buttons = input<DialogButton[]>([]);
  /** Whether the type-to-confirm gate has been satisfied. */
  readonly gateMet = input(true);
  /** Accent color for solid/outline buttons of the primary variant tone. */
  readonly accent = input('#6366f1');

  readonly choose = output<DialogButton>();
}
