import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthHeadingComponent } from '../shared/auth-heading/auth-heading.component';
import { AuthSwitchComponent } from '../shared/auth-switch/auth-switch.component';
import { TextFieldComponent } from '../shared/text-field/text-field.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthHeadingComponent, AuthSwitchComponent, TextFieldComponent],
  template: `
    <div class="animate-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <span class="text-2xl text-[var(--accent)]">◆</span>
        <span class="font-serif text-2xl font-bold">EarnLens</span>
      </div>

      <app-auth-heading
        kicker="Account recovery"
        title="Reset password"
        subtitle="Enter your email and we'll send you a reset link."
      />

      @if (sent()) {
        <div class="fp__success">
          <div class="fp__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 class="fp__success-title">Check your inbox</h3>
          <p class="fp__success-text">
            If an account exists for that email, a reset link is on its way.
          </p>
          @if (devToken()) {
            <p class="fp__dev-token">
              Dev token:
              <a class="fp__dev-link" [routerLink]="['/reset-password']" [queryParams]="{ token: devToken() }">
                {{ devToken() }}
              </a>
            </p>
          }
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="fp">
          <div class="fp__row" style="--d: 0.1s">
            <app-text-field
              [control]="emailCtrl"
              label="Email address"
              type="email"
              icon="✉"
              placeholder="you@example.com"
              autocomplete="email"
              inputmode="email"
              [errors]="{ required: 'Email is required.', email: 'Enter a valid email address.' }"
            />
          </div>

          <div class="fp__row" style="--d: 0.2s">
            <button class="fp__cta" type="submit" [disabled]="loading()" [class.fp__cta--loading]="loading()">
              <span class="fp__cta-bg"></span>
              <span class="fp__cta-shine"></span>
              <span class="fp__cta-content">
                @if (loading()) {
                  <span class="fp__cta-spinner"></span>
                  <span>Sending…</span>
                } @else {
                  <span>Send reset link</span>
                  <span class="fp__cta-arrow">→</span>
                }
              </span>
            </button>
          </div>
        </form>
      }

      <app-auth-switch prompt="Remember your password?" action="Sign in" link="/login" />
    </div>
  `,
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly devToken = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailCtrl() {
    return this.form.controls.email;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (res) => {
        this.devToken.set(res.reset_token);
        this.sent.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
