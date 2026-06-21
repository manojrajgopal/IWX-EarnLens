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
    return map[key] ?? map['default'] ?? 'This field is invalid.';
  }
}
