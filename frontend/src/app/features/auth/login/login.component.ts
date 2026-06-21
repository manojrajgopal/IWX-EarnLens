import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthHeadingComponent } from '../shared/auth-heading/auth-heading.component';
import { AuthSwitchComponent } from '../shared/auth-switch/auth-switch.component';
import { LaunchTransitionComponent } from '../shared/launch-transition/launch-transition.component';
import { LoginFormComponent } from './components/login-form/login-form.component';

/**
 * Sign-in page — orchestrates the heading, the presentational
 * <app-login-form>, the switch link and the cinematic launch
 * transition shown on success before navigating to the dashboard.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    AuthHeadingComponent,
    LoginFormComponent,
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
        kicker="Sign in"
        title="Welcome back"
        subtitle="Sign in to continue to your dashboard."
      />

      <app-login-form [form]="form" [loading]="loading()" (submitted)="submit()" />

      <app-auth-switch
        prompt="Don't have an account?"
        action="Create one"
        link="/register"
      />
    </div>

    @if (launching()) {
      <app-launch-transition
        greeting="Welcome back,"
        [name]="displayName()"
        message="Preparing your workspace…"
        (done)="onLaunchDone()"
      />
    }
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly launching = signal(false);
  readonly displayName = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: (result) => {
        this.displayName.set(result.user.full_name?.split(' ')[0] || 'there');
        this.loading.set(false);
        this.launching.set(true);
      },
      error: () => this.loading.set(false),
    });
  }

  onLaunchDone(): void {
    this.toast.success('Signed in successfully.');
    this.router.navigate(['/app/dashboard']);
  }
}
