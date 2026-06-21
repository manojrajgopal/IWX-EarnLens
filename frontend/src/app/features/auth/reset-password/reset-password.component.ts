import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthHeadingComponent } from '../shared/auth-heading/auth-heading.component';
import { AuthSwitchComponent } from '../shared/auth-switch/auth-switch.component';
import { TextFieldComponent } from '../shared/text-field/text-field.component';
import { PasswordFieldComponent } from '../shared/password-field/password-field.component';
import { passwordMatch, strongPassword } from '../shared/validators/auth.validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, AuthHeadingComponent, AuthSwitchComponent, TextFieldComponent, PasswordFieldComponent],
  template: `
    <div class="animate-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <span class="text-2xl text-[var(--accent)]">◆</span>
        <span class="font-serif text-2xl font-bold">EarnLens</span>
      </div>

      <app-auth-heading
        kicker="Secure your account"
        title="Set new password"
        subtitle="Choose a strong password for your account."
      />

      <form [formGroup]="form" (ngSubmit)="submit()" class="rp">
        <div class="rp__row" style="--d: 0.1s">
          <app-text-field
            [control]="tokenCtrl"
            label="Reset token"
            icon="🔑"
            placeholder="Paste your token here"
            [errors]="{ required: 'Token is required.' }"
          />
        </div>

        <div class="rp__row" style="--d: 0.18s">
          <app-password-field
            [control]="passwordCtrl"
            label="New password"
            placeholder="Min. 8 characters"
            autocomplete="new-password"
            [showStrength]="true"
            [errors]="{
              required: 'Password is required.',
              minlength: 'At least 8 characters.',
              lowercase: 'Add a lowercase letter.',
              uppercase: 'Add an uppercase letter.',
              number: 'Add a number.'
            }"
          />
        </div>

        <div class="rp__row" style="--d: 0.26s">
          <app-password-field
            [control]="confirmCtrl"
            label="Confirm new password"
            placeholder="Re-enter your password"
            autocomplete="new-password"
            [errors]="{ required: 'Please confirm your password.', mismatch: 'Passwords do not match.' }"
          />
          @if (mismatch()) {
            <p class="rp__mismatch">Passwords do not match.</p>
          }
        </div>

        <div class="rp__row" style="--d: 0.34s">
          <button class="rp__cta" type="submit" [disabled]="loading()" [class.rp__cta--loading]="loading()">
            <span class="rp__cta-bg"></span>
            <span class="rp__cta-shine"></span>
            <span class="rp__cta-content">
              @if (loading()) {
                <span class="rp__cta-spinner"></span>
                <span>Updating…</span>
              } @else {
                <span>Update password</span>
                <span class="rp__cta-arrow">→</span>
              }
            </span>
          </button>
        </div>
      </form>

      <app-auth-switch prompt="Remember your password?" action="Sign in" link="/login" />
    </div>
  `,
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      token: [this.route.snapshot.queryParamMap.get('token') ?? '', [Validators.required]],
      new_password: ['', [Validators.required, strongPassword(8)]],
      confirm_new_password: ['', [Validators.required]],
    },
    { validators: passwordMatch('new_password', 'confirm_new_password') },
  );

  get tokenCtrl(): FormControl { return this.form.controls.token; }
  get passwordCtrl(): FormControl { return this.form.controls.new_password; }
  get confirmCtrl(): FormControl { return this.form.controls.confirm_new_password; }

  mismatch(): boolean {
    const confirm = this.form.get('confirm_new_password');
    return (
      this.form.hasError('passwordMismatch') &&
      !!confirm && (confirm.dirty || confirm.touched) && !!confirm.value
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { token, new_password, confirm_new_password } = this.form.getRawValue();
    this.auth.resetPassword(token, new_password, confirm_new_password).subscribe({
      next: () => {
        this.toast.success('Password updated. Please sign in.');
        this.router.navigate(['/login']);
      },
      error: () => this.loading.set(false),
    });
  }
}
