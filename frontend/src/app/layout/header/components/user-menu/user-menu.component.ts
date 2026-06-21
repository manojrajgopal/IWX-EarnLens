import { Component, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
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

      <div class="um__wrap" #wrap (mouseenter)="onEnter()" (mouseleave)="onLeave()">
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
  private readonly wrap = viewChild<ElementRef<HTMLElement>>('wrap');
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

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

  onEnter(): void {
    this.clearLeaveTimer();
    this.open.set(true);
  }

  onLeave(): void {
    this.clearLeaveTimer();
    this.leaveTimer = setTimeout(() => this.open.set(false), 150);
  }

  toggle(): void {
    this.clearLeaveTimer();
    this.open.update((v) => !v);
  }

  close(): void {
    this.clearLeaveTimer();
    this.open.set(false);
  }

  private clearLeaveTimer(): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  }

  logout(): void {
    this.close();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const el = this.wrap()?.nativeElement;
    if (el && !el.contains(e.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
