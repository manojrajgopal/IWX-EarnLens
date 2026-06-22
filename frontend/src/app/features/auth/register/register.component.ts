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
import { OtpVerifyComponent } from './components/otp-verify/otp-verify.component';

/**
 * Registration page — a two-step flow:
 *   1. <app-register-form> collects the details and requests an email OTP.
 *   2. <app-otp-verify> confirms the code; only then is the account created
 *      and the cinematic launch transition shown.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    AuthHeadingComponent,
    RegisterFormComponent,
    OtpVerifyComponent,
    AuthSwitchComponent,
    LaunchTransitionComponent,
  ],
  template: `
    <div class="animate-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <span class="text-2xl text-[var(--accent)]">◆</span>
        <span class="font-serif text-2xl font-bold">EarnLens</span>
      </div>

      @if (step() === 'form') {
        <app-auth-heading
          kicker="Get started"
          title="Create account"
          subtitle="Start tracking your income in minutes."
        />

        <app-register-form [form]="form" [loading]="loading()" (submitted)="submit()" />

        <app-auth-switch prompt="Already have an account?" action="Sign in" link="/login" />
      } @else {
        <app-auth-heading
          kicker="Verify email"
          title="Enter your code"
          subtitle="One quick step to secure your account."
        />

        <app-otp-verify
          [email]="otpEmail()"
          [loading]="verifying()"
          [resending]="resending()"
          [error]="otpError()"
          [resendsRemaining]="resendsRemaining()"
          [expiresIn]="expiresIn()"
          (verify)="onVerify($event)"
          (resend)="onResend()"
          (back)="onBackToForm()"
        />
      }
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

  /** Which phase of registration the user is on. */
  readonly step = signal<'form' | 'otp'>('form');
  /** OTP-phase state. */
  readonly verifying = signal(false);
  readonly resending = signal(false);
  readonly otpError = signal<string | null>(null);
  readonly otpEmail = signal('');
  readonly registrationId = signal('');
  readonly resendsRemaining = signal(3);
  readonly expiresIn = signal(600);

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
    this.auth
      .register({ full_name, username, email, phone, password, confirm_password: confirmPassword })
      .subscribe({
        next: (pending) => {
          this.loading.set(false);
          this.registrationId.set(pending.registration_id);
          this.otpEmail.set(pending.email);
          this.expiresIn.set(pending.expires_in);
          this.resendsRemaining.set(pending.resends_remaining);
          this.otpError.set(null);
          this.step.set('otp');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.handleServerError(err);
        },
      });
  }

  onVerify(code: string): void {
    this.verifying.set(true);
    this.otpError.set(null);
    this.auth.verifyRegistration(this.registrationId(), code).subscribe({
      next: (result) => {
        this.displayName.set(result.user.full_name?.split(' ')[0] || 'there');
        this.verifying.set(false);
        this.launching.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.verifying.set(false);
        this.handleOtpError(err);
      },
    });
  }

  onResend(): void {
    this.resending.set(true);
    this.otpError.set(null);
    this.auth.resendRegistrationOtp(this.registrationId()).subscribe({
      next: (pending) => {
        this.resending.set(false);
        this.expiresIn.set(pending.expires_in);
        this.resendsRemaining.set(pending.resends_remaining);
        this.toast.success('A new code is on its way.');
      },
      error: (err: HttpErrorResponse) => {
        this.resending.set(false);
        this.handleOtpError(err);
      },
    });
  }

  onBackToForm(): void {
    this.otpError.set(null);
    this.step.set('form');
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

  private handleOtpError(err: HttpErrorResponse): void {
    const body = err.error as { error?: { message?: string; details?: { field?: string } } } | null;
    const field = body?.error?.details?.field;
    const message = body?.error?.message || 'Verification failed.';

    if (field === 'otp') {
      // Wrong code — keep the user on the OTP step to retry.
      this.otpError.set(message);
    } else {
      // Session expired / pending registration gone — restart the flow.
      this.toast.error(message);
      this.step.set('form');
    }
  }

  onLaunchDone(): void {
    this.draft.clear();
    this.toast.success('Welcome to EarnLens!');
    this.router.navigate(['/app/welcome']);
  }
}
