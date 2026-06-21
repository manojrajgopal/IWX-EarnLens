import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TextFieldComponent } from '../../../shared/text-field/text-field.component';
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component';

/** Presentational sign-in form. Owns no state — driven by the parent. */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, PasswordFieldComponent],
  template: `
    <form [formGroup]="form()" (ngSubmit)="submitted.emit()" class="lf">
      <div class="lf__row" style="--d: 0.1s">
        <app-text-field
          [control]="ctrl('email')"
          label="Email"
          type="email"
          icon="✉"
          placeholder="you@example.com"
          autocomplete="email"
          inputmode="email"
          [errors]="{ required: 'Email is required.', email: 'Enter a valid email address.' }"
        />
      </div>

      <div class="lf__row" style="--d: 0.18s">
        <app-password-field
          [control]="ctrl('password')"
          label="Password"
          autocomplete="current-password"
          [errors]="{ required: 'Password is required.' }"
        >
          <a action routerLink="/forgot-password" class="lf__forgot">Forgot password?</a>
        </app-password-field>
      </div>

      <div class="lf__row lf__between" style="--d: 0.26s">
        <label class="lf__check">
          <input type="checkbox" [formControl]="ctrl('remember')" />
          <span class="lf__check-box"></span>
          <span>Remember me</span>
        </label>
      </div>

      <div class="lf__row" style="--d: 0.34s">
        <button class="lf__cta" type="submit" [disabled]="loading()" [class.lf__cta--loading]="loading()">
          <span class="lf__cta-bg"></span>
          <span class="lf__cta-shine"></span>
          <span class="lf__cta-glow"></span>
          <span class="lf__cta-content">
            @if (loading()) {
              <span class="lf__cta-spinner"></span>
              <span>Signing in…</span>
            } @else {
              <span>Sign in</span>
              <span class="lf__cta-arrow">→</span>
            }
          </span>
        </button>
      </div>
    </form>
  `,
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent {
  readonly form = input.required<FormGroup>();
  readonly loading = input(false);
  readonly submitted = output<void>();

  ctrl(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }
}
