import { Component, computed, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="topbar">
      <button class="icon-btn lg:hidden" (click)="toggleSidebar.emit()" aria-label="Menu">☰</button>

      <div class="flex-1"></div>

      <button class="icon-btn" (click)="theme.toggle()" aria-label="Toggle theme">
        {{ isDark() ? '☀' : '☾' }}
      </button>

      <div class="relative">
        <button class="user-btn" (click)="toggleMenu()">
          <span class="avatar">{{ initials() }}</span>
          <span class="hidden sm:block text-sm font-medium">{{ user()?.full_name }}</span>
          <span class="text-xs text-muted">▾</span>
        </button>

        @if (menuOpen()) {
          <div class="user-menu card">
            <div class="px-3 py-2 border-b border-[var(--border-color)]">
              <p class="text-sm font-semibold truncate">{{ user()?.full_name }}</p>
              <p class="text-xs text-muted truncate">{{ user()?.email }}</p>
            </div>
            <a routerLink="/app/profile" class="menu-item" (click)="menuOpen.set(false)">Profile</a>
            <a routerLink="/app/settings" class="menu-item" (click)="menuOpen.set(false)">Settings</a>
            <button class="menu-item text-negative w-full text-left" (click)="logout()">
              Sign out
            </button>
          </div>
        }
      </div>
    </header>
  `,
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly toggleSidebar = output<void>();

  readonly user = this.auth.currentUser;
  readonly menuOpen = signal(false);

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

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
