import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferencesService } from '../../core/services/preferences.service';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import {
  Preferences,
  NotificationPreferences,
} from '../../core/models/preferences.model';
import { CURRENCY_OPTIONS } from '../../core/constants/app.constants';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import {
  EmailNotificationsDialogComponent,
  EmailNotificationsResult,
} from './dialog/email-notifications-dialog/email-notifications-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    EmailNotificationsDialogComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private readonly api = inject(PreferencesService);
  private readonly location = inject(Location);
  private readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);

  readonly currencyOptions = CURRENCY_OPTIONS;
  readonly themeModes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀' },
    { value: 'dark', label: 'Dark', icon: '☾' },
    { value: 'system', label: 'System', icon: '⚙' },
  ];
  readonly groupOptions = ['day', 'week', 'month', 'quarter', 'year'];
  readonly chartStyles = ['line', 'area', 'bar', 'stacked'];

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly prefs = signal<Preferences | null>(null);
  readonly themeMode = this.theme.mode;
  readonly notificationsOpen = signal(false);

  ngOnInit(): void {
    this.api.get().subscribe({
      next: (p) => {
        this.prefs.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.patch({ theme: mode });
  }

  update<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
    this.prefs.update((p) => (p ? { ...p, [key]: value } : p));
    this.patch({ [key]: value } as Partial<Preferences>);
  }

  private patch(partial: Partial<Preferences>): void {
    this.saving.set(true);
    this.api.update(partial).subscribe({
      next: (p) => {
        this.prefs.set(p);
        this.saving.set(false);
        this.toast.success('Preferences saved.');
      },
      error: () => this.saving.set(false),
    });
  }

  // ── email notifications ──────────────────────────────────
  get emailEnabled(): boolean {
    return this.prefs()?.notifications?.email ?? true;
  }

  get channelState(): Record<string, boolean> {
    return this.prefs()?.notifications?.channels ?? {};
  }

  openNotifications(): void {
    this.notificationsOpen.set(true);
  }

  saveNotifications(result: EmailNotificationsResult): void {
    this.notificationsOpen.set(false);
    const current = this.prefs()?.notifications ?? ({} as NotificationPreferences);
    const next: NotificationPreferences = {
      ...current,
      email: result.email,
      channels: { ...result.channels },
    };
    this.update('notifications', next);
  }

  goBack(): void {
    this.location.back();
  }
}
