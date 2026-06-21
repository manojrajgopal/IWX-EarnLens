import { Component, computed, input, output, signal } from '@angular/core';
import { DialogButton, DialogInstance } from '../../models/dialog.model';
import { DIALOG_THEME } from '../../config/dialog-theme.config';
import { DialogIconComponent } from '../dialog-icon/dialog-icon.component';
import { DialogActionsComponent } from '../dialog-actions/dialog-actions.component';

/**
 * The cinematic dialog panel — glassmorphic surface, animated glow
 * border, staggered content reveal and an optional type-to-confirm
 * gate. Purely presentational: emits the chosen button to the host.
 */
@Component({
  selector: 'app-dialog-panel',
  standalone: true,
  imports: [DialogIconComponent, DialogActionsComponent],
  template: `
    <div
      class="dp"
      [class.dp--leaving]="leaving()"
      [style.--accent]="theme().accent"
      [style.--glow]="theme().glow"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="data().title"
      (click)="$event.stopPropagation()"
    >
      <!-- Animated glow border -->
      <span class="dp__glow"></span>

      <div class="dp__inner">
        <app-dialog-icon [variant]="data().variant!" [icon]="data().icon ?? null" />

        <h2 class="dp__title">{{ data().title }}</h2>

        @if (data().message || data().highlight) {
          <p class="dp__message">
            {{ data().message }}
            @if (data().highlight) {
              <span class="dp__highlight">{{ data().highlight }}</span>
            }
          </p>
        }

        @if (data().note) {
          <p class="dp__note">{{ data().note }}</p>
        }

        @if (data().requireText) {
          <div class="dp__gate">
            <label class="dp__gate-label">
              Type <strong>{{ data().requireText }}</strong> to confirm
            </label>
            <input
              class="dp__gate-input"
              [value]="typed()"
              (input)="onType($event)"
              [placeholder]="data().requireText || ''"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
        }

        <app-dialog-actions
          [buttons]="data().buttons"
          [gateMet]="gateMet()"
          [accent]="theme().accent"
          (choose)="onChoose($event)"
        />
      </div>
    </div>
  `,
  styleUrl: './dialog-panel.component.css',
})
export class DialogPanelComponent {
  readonly data = input.required<DialogInstance>();
  readonly leaving = input(false);

  readonly chosen = output<DialogButton>();

  protected readonly typed = signal('');

  protected readonly theme = computed(() => DIALOG_THEME[this.data().variant ?? 'question']);

  protected readonly gateMet = computed(() => {
    const gate = this.data().requireText;
    if (!gate) return true;
    return this.typed().trim().toLowerCase() === gate.trim().toLowerCase();
  });

  protected onType(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  protected onChoose(btn: DialogButton): void {
    if (btn.gated && !this.gateMet()) return;
    this.chosen.emit(btn);
  }
}
