import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="animate-in">
      <h1 class="font-serif text-4xl font-bold mb-2">Set new password</h1>
      <p class="text-secondary mb-8">Choose a strong password for your account.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="field-label">Reset token</label>
          <input class="input" formControlName="token" placeholder="Paste your token" />
          @if (invalid('token')) {
            <p class="error-text">Token is required.</p>
          }
        </div>
        <div>
          <label class="field-label">New password</label>
          <input class="input" type="password" formControlName="new_password" placeholder="Min. 8 characters" />
          @if (invalid('new_password')) {
            <p class="error-text">Password must be at least 8 characters.</p>
          }
        </div>
        <button class="btn-primary w-full" [disabled]="loading()">
          {{ loading() ? 'Updating…' : 'Update password' }}
        </button>
      </form>

      <p class="text-sm text-secondary mt-6 text-center">
        <a routerLink="/login" class="text-[var(--accent)] font-medium hover:underline">
          Back to sign in
        </a>
      </p>
    </div>
  `,
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    token: [this.route.snapshot.queryParamMap.get('token') ?? '', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
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
    const { token, new_password } = this.form.getRawValue();
    this.auth.resetPassword(token, new_password).subscribe({
      next: () => {
        this.toast.success('Password updated. Please sign in.');
        this.router.navigate(['/login']);
      },
      error: () => this.loading.set(false),
    });
  }
}
