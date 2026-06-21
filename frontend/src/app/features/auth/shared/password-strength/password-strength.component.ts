import { Component, computed, input } from '@angular/core';
import { passwordScore } from '../validators/auth.validators';

/** Live password strength meter — 4 segments + label. */
@Component({
  selector: 'app-password-strength',
  standalone: true,
  template: `
    <div class="ps">
      <div class="ps__bars">
        @for (i of [0, 1, 2, 3]; track i) {
          <span
            class="ps__bar"
            [class.ps__bar--on]="i < score()"
            [attr.data-level]="level()"
          ></span>
        }
      </div>
      <span class="ps__label" [attr.data-level]="level()">{{ label() }}</span>
    </div>
  `,
  styleUrl: './password-strength.component.css',
})
export class PasswordStrengthComponent {
  readonly value = input('');
  readonly score = computed(() => passwordScore(this.value()));
  readonly level = computed(() => {
    const s = this.score();
    if (s <= 1) return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
  });
  readonly label = computed(() => {
    if (!this.value()) return '';
    return { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }[this.level()];
  });
}
