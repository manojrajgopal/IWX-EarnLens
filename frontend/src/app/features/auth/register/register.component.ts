import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="animate-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <span class="text-2xl text-[var(--accent)]">◆</span>
        <span class="font-serif text-2xl font-bold">EarnLens</span>
      </div>

      <h1 class="font-serif text-4xl font-bold mb-2">Create account</h1>
      <p class="text-secondary mb-8">Start tracking your income in minutes.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="field-label">Full name</label>
          <input class="input" formControlName="full_name" placeholder="Jane Doe" />
          @if (invalid('full_name')) {
            <p class="error-text">Name is required.</p>
          }
        </div>

        <div>
          <label class="field-label">Email</label>
          <input class="input" type="email" formControlName="email" placeholder="you@example.com" />
          @if (invalid('email')) {
            <p class="error-text">Enter a valid email.</p>
          }
        </div>

        <div>
          <label class="field-label">Password</label>
          <input class="input" type="password" formControlName="password" placeholder="Min. 8 characters" />
          @if (invalid('password')) {
            <p class="error-text">Password must be at least 8 characters.</p>
          }
        </div>

        <button class="btn-primary w-full" [disabled]="loading()">
          {{ loading() ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="text-sm text-secondary mt-6 text-center">
        Already have an account?
        <a routerLink="/login" class="text-[var(--accent)] font-medium hover:underline">Sign in</a>
      </p>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
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
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Welcome to EarnLens!');
        this.router.navigate(['/app/dashboard']);
      },
      error: () => this.loading.set(false),
    });
  }
}
