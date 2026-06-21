import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="animate-in">
      <h1 class="font-serif text-4xl font-bold mb-2">Reset password</h1>
      <p class="text-secondary mb-8">
        Enter your email and we'll send you a reset link.
      </p>

      @if (sent()) {
        <div class="card card-pad mb-6">
          <p class="text-sm">
            If an account exists for that email, a reset link is on its way.
          </p>
          @if (devToken()) {
            <p class="text-xs text-muted mt-3 break-all">
              Dev token:
              <a class="text-[var(--accent)]" [routerLink]="['/reset-password']" [queryParams]="{ token: devToken() }">
                {{ devToken() }}
              </a>
            </p>
          }
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="field-label">Email</label>
            <input class="input" type="email" formControlName="email" placeholder="you@example.com" />
            @if (invalid('email')) {
              <p class="error-text">Enter a valid email.</p>
            }
          </div>
          <button class="btn-primary w-full" [disabled]="loading()">
            {{ loading() ? 'Sending…' : 'Send reset link' }}
          </button>
        </form>
      }

      <p class="text-sm text-secondary mt-6 text-center">
        <a routerLink="/login" class="text-[var(--accent)] font-medium hover:underline">
          Back to sign in
        </a>
      </p>
    </div>
  `,
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

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
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
