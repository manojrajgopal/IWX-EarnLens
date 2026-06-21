import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="animate-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <span class="text-2xl text-[var(--accent)]">◆</span>
        <span class="font-serif text-2xl font-bold">EarnLens</span>
      </div>

      <h1 class="font-serif text-4xl font-bold mb-2">Welcome back</h1>
      <p class="text-secondary mb-8">Sign in to continue to your dashboard.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="field-label">Email</label>
          <input class="input" type="email" formControlName="email" placeholder="you@example.com" />
          @if (invalid('email')) {
            <p class="error-text">Enter a valid email.</p>
          }
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label class="field-label">Password</label>
            <a routerLink="/forgot-password" class="text-xs text-[var(--accent)] hover:underline">
              Forgot password?
            </a>
          </div>
          <input class="input" type="password" formControlName="password" placeholder="••••••••" />
          @if (invalid('password')) {
            <p class="error-text">Password is required.</p>
          }
        </div>

        <button class="btn-primary w-full" [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="text-sm text-secondary mt-6 text-center">
        Don't have an account?
        <a routerLink="/register" class="text-[var(--accent)] font-medium hover:underline">
          Create one
        </a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Signed in successfully.');
        this.router.navigate(['/app/dashboard']);
      },
      error: () => this.loading.set(false),
    });
  }
}
