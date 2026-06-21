import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CURRENCY_OPTIONS } from '../../core/constants/app.constants';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { AvatarPickerComponent } from '../../shared/ui/avatar-picker';
import { passwordMatch } from '../auth/shared/validators/auth.validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TimeAgoPipe, AvatarPickerComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly profileApi = inject(ProfileService);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly currencyOptions = CURRENCY_OPTIONS;
  readonly user = this.auth.currentUser;
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);

  readonly initials = computed(() => {
    const name = this.user()?.full_name ?? '';
    return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  });

  readonly avatarUrl = computed(() => this.user()?.avatar_url || null);

  readonly profileForm = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    default_currency: ['INR', [Validators.required]],
    avatar_url: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_new_password: ['', [Validators.required]],
    },
    { validators: passwordMatch('new_password', 'confirm_new_password') },
  );

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.profileForm.patchValue({
        full_name: u.full_name,
        default_currency: u.default_currency,
        avatar_url: u.avatar_url ?? '',
      });
    }
  }

  invalid(form: 'profile' | 'password', name: string): boolean {
    const group: FormGroup = form === 'profile' ? this.profileForm : this.passwordForm;
    const control = group.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    this.profileApi.update(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Profile updated.');
        this.savingProfile.set(false);
      },
      error: () => this.savingProfile.set(false),
    });
  }

  onAvatarPick(url: string): void {
    this.profileForm.patchValue({ avatar_url: url });
    this.profileForm.markAsDirty();
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    this.profileApi.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Password changed.');
        this.passwordForm.reset({ current_password: '', new_password: '', confirm_new_password: '' });
        this.savingPassword.set(false);
      },
      error: () => this.savingPassword.set(false),
    });
  }

  goBack(): void {
    this.location.back();
  }
}
