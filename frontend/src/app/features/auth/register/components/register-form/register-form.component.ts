import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TextFieldComponent } from '../../../shared/text-field/text-field.component';
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component';
import { LegalAcceptanceService } from '../../../../legal/shared/services/legal-acceptance.service';

/** Presentational registration form. Driven entirely by the parent. */
@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, PasswordFieldComponent],
  template: `
    <form [formGroup]="form()" (ngSubmit)="submitted.emit()" class="rf">
      <div class="rf__grid">
        <div class="rf__row" style="--d: 0.08s">
          <app-text-field
            [control]="ctrl('full_name')"
            label="Full name"
            icon="☺"
            placeholder="Jane Doe"
            autocomplete="name"
            [errors]="{ required: 'Name is required.', minlength: 'Use at least 2 characters.' }"
          />
        </div>

        <div class="rf__row" style="--d: 0.14s">
          <app-text-field
            [control]="ctrl('username')"
            label="Username"
            icon="@"
            placeholder="janedoe"
            autocomplete="username"
            [lowercase]="true"
            [inputFilter]="usernameFilter"
            [errors]="{
              required: 'Username is required.',
              username: '3-20 chars, lowercase letters & numbers only.'
            }"
          />
        </div>
      </div>

      <div class="rf__row" style="--d: 0.2s">
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

      <div class="rf__row" style="--d: 0.26s">
        <app-text-field
          [control]="ctrl('phone')"
          label="Phone number"
          type="tel"
          icon="✆"
          placeholder="+1 555 123 4567"
          autocomplete="tel"
          inputmode="tel"
          [errors]="{ required: 'Phone is required.', phone: 'Enter a valid phone number.' }"
        />
      </div>

      <div class="rf__row" style="--d: 0.32s">
        <app-password-field
          [control]="ctrl('password')"
          label="Password"
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

      <div class="rf__row" style="--d: 0.38s">
        <app-password-field
          [control]="ctrl('confirmPassword')"
          label="Confirm password"
          placeholder="Re-enter your password"
          autocomplete="new-password"
          [errors]="{ required: 'Please confirm your password.', mismatch: 'Passwords do not match.' }"
        />
        @if (mismatch()) {
          <p class="rf__mismatch">Passwords do not match.</p>
        }
      </div>

      <div class="rf__row" style="--d: 0.44s">
        <label class="rf__terms" [class.rf__terms--error]="termsError()" [class.rf__terms--locked]="!canCheck()"
               (click)="onTermsClick($event)">
          <input type="checkbox" [formControl]="ctrl('terms')" [attr.disabled]="canCheck() ? null : true" />
          <span class="rf__terms-box"></span>
          <span>I agree to the
            <a routerLink="/terms" class="rf__terms-link" [class.rf__shake]="shaking()">Terms of Service</a> and
            <a routerLink="/privacy" class="rf__terms-link" [class.rf__shake]="shaking()">Privacy Policy</a>.</span>
        </label>
        @if (showHint()) {
          <p class="rf__terms-hint" [class.rf__shake]="shaking()">Please read and accept both documents to continue.</p>
        }
      </div>

      <div class="rf__row" style="--d: 0.5s">
        <button class="rf__cta" type="submit" [disabled]="loading()" [class.rf__cta--loading]="loading()">
          <span class="rf__cta-bg"></span>
          <span class="rf__cta-shine"></span>
          <span class="rf__cta-glow"></span>
          <span class="rf__cta-content">
            @if (loading()) {
              <span class="rf__cta-spinner"></span>
              <span>Creating account…</span>
            } @else {
              <span>Create account</span>
              <span class="rf__cta-arrow">→</span>
            }
          </span>
        </button>
      </div>
    </form>
  `,
  styleUrl: './register-form.component.css',
})
export class RegisterFormComponent {
  private readonly acceptance = inject(LegalAcceptanceService);

  readonly form = input.required<FormGroup>();
  readonly loading = input(false);
  readonly submitted = output<void>();

  /** True when both legal documents have been accepted in this session. */
  readonly canCheck = computed(() => this.acceptance.termsAccepted() && this.acceptance.privacyAccepted());

  /** Only allow lowercase letters and numbers in username. */
  readonly usernameFilter = /a-z0-9/;

  /** Shake animation trigger. */
  readonly shaking = signal(false);
  /** Show hint only after user attempts to click locked checkbox. */
  readonly showHint = signal(false);

  ctrl(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }

  mismatch(): boolean {
    const g = this.form();
    const confirm = g.get('confirmPassword');
    return (
      g.hasError('passwordMismatch') && !!confirm && (confirm.dirty || confirm.touched) && !!confirm.value
    );
  }

  termsError(): boolean {
    const c = this.ctrl('terms');
    return c.invalid && c.touched;
  }

  /** Triggered when user clicks the terms label area while locked. */
  onTermsClick(event: MouseEvent): void {
    if (this.canCheck()) return;
    // Allow clicks on the router links to navigate
    if ((event.target as HTMLElement).tagName === 'A') return;
    event.preventDefault();
    this.showHint.set(true);
    this.shaking.set(true);
    setTimeout(() => this.shaking.set(false), 600);
  }
}
