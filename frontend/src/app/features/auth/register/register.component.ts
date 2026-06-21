import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LegalAcceptanceService } from '../../legal/shared/services/legal-acceptance.service';
import { RegisterDraftService } from './services/register-draft.service';
import { AuthHeadingComponent } from '../shared/auth-heading/auth-heading.component';
import { AuthSwitchComponent } from '../shared/auth-switch/auth-switch.component';
import { LaunchTransitionComponent } from '../shared/launch-transition/launch-transition.component';
import {
  passwordMatch,
  phone,
  strongPassword,
  username,
} from '../shared/validators/auth.validators';
import { RegisterFormComponent } from './components/register-form/register-form.component';

/**
 * Registration page — orchestrates the heading, the presentational
 * <app-register-form> (with extended fields + validation) and the
 * cinematic launch transition shown on success.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    AuthHeadingComponent,
    RegisterFormComponent,
    AuthSwitchComponent,
    LaunchTransitionComponent,
  ],
  template: `
    <div class="animate-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <span class="text-2xl text-[var(--accent)]">◆</span>
        <span class="font-serif text-2xl font-bold">EarnLens</span>
      </div>

      <app-auth-heading
        kicker="Get started"
        title="Create account"
        subtitle="Start tracking your income in minutes."
      />

      <app-register-form [form]="form" [loading]="loading()" (submitted)="submit()" />

      <app-auth-switch prompt="Already have an account?" action="Sign in" link="/login" />
    </div>

    @if (launching()) {
      <app-launch-transition
        greeting="Welcome to EarnLens,"
        [name]="displayName()"
        message="Setting up your account…"
        (done)="onLaunchDone()"
      />
    }
  `,
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly acceptance = inject(LegalAcceptanceService);
  private readonly draft = inject(RegisterDraftService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly launching = signal(false);
  readonly displayName = signal('');

  /** Auto-tick the terms checkbox when user returns from legal pages. */
  private readonly autoTick = effect(() => {
    if (this.acceptance.termsAccepted() && this.acceptance.privacyAccepted()) {
      this.form.get('terms')?.setValue(true);
    }
  });

  readonly form = this.fb.nonNullable.group(
    {
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, username()]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phone()]],
      password: ['', [Validators.required, strongPassword(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatch('password', 'confirmPassword') },
  );

  ngOnInit(): void {
    // Restore saved draft on return from legal pages
    const saved = this.draft.load();
    if (saved) {
      this.form.patchValue(saved, { emitEvent: false });
    }

    // Save draft whenever component is destroyed (navigating away)
    this.destroyRef.onDestroy(() => {
      if (!this.launching()) {
        const { full_name, username, email, phone, password, confirmPassword } = this.form.getRawValue();
        this.draft.save({ full_name, username, email, phone, password, confirmPassword });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { full_name, username, email, phone, password, confirmPassword } = this.form.getRawValue();
    this.auth.register({ full_name, username, email, phone, password, confirm_password: confirmPassword }).subscribe({
      next: (result) => {
        this.displayName.set(result.user.full_name?.split(' ')[0] || 'there');
        this.loading.set(false);
        this.launching.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.handleServerError(err);
      },
    });
  }

  private handleServerError(err: HttpErrorResponse): void {
    const body = err.error as { error?: { message?: string; details?: { field?: string } } } | null;
    const field = body?.error?.details?.field;
    const message = body?.error?.message || 'Registration failed.';

    if (field && this.form.get(field)) {
      this.form.get(field)!.setErrors({ server: message });
      this.form.get(field)!.markAsTouched();
    }
  }

  onLaunchDone(): void {
    this.draft.clear();
    this.toast.success('Welcome to EarnLens!');
    this.router.navigate(['/app/dashboard']);
  }
}
