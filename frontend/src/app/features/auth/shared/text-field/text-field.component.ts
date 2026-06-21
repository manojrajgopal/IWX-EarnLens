import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Labeled text input bound to a reactive FormControl, with an icon,
 * floating focus animation and contextual error messages.
 */
@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="tf" [class.tf--error]="showError()">
      <label class="tf__label" [for]="fieldId()">{{ label() }}</label>
      <div class="tf__box">
        @if (icon()) {
          <span class="tf__icon">{{ icon() }}</span>
        }
        <input
          class="tf__input"
          [id]="fieldId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [formControl]="control()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputmode()"
          (input)="onInput($event)"
        />
        <ng-content select="[suffix]" />
      </div>
      <div class="tf__msg" [class.tf__msg--show]="showError()">
        @if (showError()) {
          <span>{{ errorText() }}</span>
        }
      </div>
    </div>
  `,
  styleUrl: './text-field.component.css',
})
export class TextFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input('');
  readonly type = input('text');
  readonly placeholder = input('');
  readonly icon = input('');
  readonly autocomplete = input<string | null>(null);
  readonly inputmode = input<string | null>(null);
  readonly errors = input<Record<string, string>>({});
  /** Regex filter: only characters matching this pattern are kept on input. */
  readonly inputFilter = input<RegExp | null>(null);
  /** Auto-lowercase the input value. */
  readonly lowercase = input(false);

  readonly fieldId = computed(() => 'tf-' + Math.random().toString(36).slice(2, 8));

  showError(): boolean {
    const c = this.control();
    return c.invalid && (c.dirty || c.touched);
  }

  errorText(): string {
    const c = this.control();
    const map = this.errors();
    if (!c.errors) return '';
    const key = Object.keys(c.errors)[0];
    // Server errors carry the message as the value directly
    if (key === 'server' && typeof c.errors[key] === 'string') {
      return c.errors[key];
    }
    return map[key] ?? map['default'] ?? 'This field is invalid.';
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (this.lowercase()) {
      value = value.toLowerCase();
    }

    const filter = this.inputFilter();
    if (filter) {
      value = value.replace(new RegExp(`[^${filter.source}]`, 'g'), '');
    }

    if (value !== input.value) {
      input.value = value;
      this.control().setValue(value, { emitEvent: true });
    }
  }
}
