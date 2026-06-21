import { Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthComponent } from '../password-strength/password-strength.component';

/**
 * Password input bound to a reactive FormControl, with a professional
 * show/hide (eye) toggle and an optional live strength meter.
 */
@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordStrengthComponent],
  template: `
    <div class="pf" [class.pf--error]="showError()">
      <div class="pf__top">
        <label class="pf__label" [for]="fieldId()">{{ label() }}</label>
        <ng-content select="[action]" />
      </div>

      <div class="pf__box">
        <span class="pf__icon">⚷</span>
        <input
          class="pf__input"
          [id]="fieldId()"
          [type]="visible() ? 'text' : 'password'"
          [placeholder]="placeholder()"
          [formControl]="control()"
          [attr.autocomplete]="autocomplete()"
        />
        <button
          class="pf__eye"
          type="button"
          (click)="toggle()"
          [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
          tabindex="-1"
        >
          {{ visible() ? '🙈' : '👁' }}
        </button>
      </div>

      @if (showStrength()) {
        <app-password-strength [value]="control().value || ''" />
      }

      <div class="pf__msg" [class.pf__msg--show]="showError()">
        @if (showError()) {
          <span>{{ errorText() }}</span>
        }
      </div>
    </div>
  `,
  styleUrl: './password-field.component.css',
})
export class PasswordFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input('Password');
  readonly placeholder = input('••••••••');
  readonly autocomplete = input<string | null>('current-password');
  readonly showStrength = input(false);
  readonly errors = input<Record<string, string>>({});

  readonly visible = signal(false);
  readonly fieldId = computed(() => 'pf-' + Math.random().toString(36).slice(2, 8));

  toggle(): void {
    this.visible.update((v) => !v);
  }

  showError(): boolean {
    const c = this.control();
    return c.invalid && (c.dirty || c.touched);
  }

  errorText(): string {
    const c = this.control();
    const map = this.errors();
    if (!c.errors) return '';
    const key = Object.keys(c.errors)[0];
    if (key === 'server' && typeof c.errors[key] === 'string') {
      return c.errors[key];
    }
    return map[key] ?? map['default'] ?? 'This field is invalid.';
  }
}
