import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

/**
 * Right-side cluster: theme toggle + avatar dropdown with account links.
 */
@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="um">
      <button class="um__theme" type="button" (click)="theme.toggle()" aria-label="Toggle theme">
        <span>{{ isDark() ? '☀' : '☾' }}</span>
      </button>

      <div class="um__wrap">
        <button class="um__avatar" type="button" (click)="toggle()" [class.um__avatar--open]="open()">
          {{ initials() || '☺' }}
        </button>

        @if (open()) {
          <div class="um__panel">
            <div class="um__head">
              <span class="um__name">{{ user()?.full_name || 'Account' }}</span>
              <span class="um__email">{{ user()?.email }}</span>
            </div>
            <div class="um__links">
              <a class="um__link" routerLink="/app/profile" (click)="close()">
                <span class="um__link-icon">☺</span><span>Profile</span>
              </a>
              <a class="um__link" routerLink="/app/settings" (click)="close()">
                <span class="um__link-icon">⚙</span><span>Settings</span>
              </a>
              <a class="um__link" routerLink="/app/activity" (click)="close()">
                <span class="um__link-icon">↻</span><span>Activity</span>
              </a>
            </div>
            <button class="um__logout" type="button" (click)="logout()">
              <span class="um__link-icon">⏻</span><span>Sign out</span>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './user-menu.component.css',
})
export class UserMenuComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  readonly user = this.auth.currentUser;
  readonly open = signal(false);

  readonly initials = computed(() => {
    const name = this.user()?.full_name ?? '';
    return name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  isDark(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  logout(): void {
    this.close();
    this.auth.logout();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
