import { Component, computed, input } from '@angular/core';
import { DialogVariant } from '../../models/dialog.model';
import { DIALOG_THEME } from '../../config/dialog-theme.config';

/**
 * Animated icon badge — a glowing halo, a sweeping accent ring and
 * a stroke-draw icon that "writes" itself in on mount.
 */
@Component({
  selector: 'app-dialog-icon',
  standalone: true,
  template: `
    <div
      class="di"
      [style.--accent]="theme().accent"
      [style.--halo]="theme().halo"
    >
      <span class="di__pulse"></span>
      <span class="di__ring"></span>
      <span class="di__badge">
        @if (isEmoji()) {
          <span class="di__emoji">{{ icon() }}</span>
        } @else {
          <svg
            class="di__svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path [attr.d]="iconPath()" />
          </svg>
        }
      </span>
    </div>
  `,
  styleUrl: './dialog-icon.component.css',
})
export class DialogIconComponent {
  readonly variant = input<DialogVariant>('question');
  /** Optional override: an emoji or a raw SVG path `d`. */
  readonly icon = input<string | null>(null);

  protected readonly theme = computed(() => DIALOG_THEME[this.variant()]);

  /** Treat short non-path strings as emoji/text. */
  protected readonly isEmoji = computed(() => {
    const i = this.icon();
    if (!i) return false;
    // SVG path data starts with a move command (M/m) and contains digits.
    return !/^[Mm][\d.\s-]/.test(i);
  });

  protected readonly iconPath = computed(() => {
    const override = this.icon();
    if (override && !this.isEmoji()) return override;
    return this.theme().iconPath;
  });
}
