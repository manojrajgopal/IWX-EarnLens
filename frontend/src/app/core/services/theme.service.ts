import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
const THEME_KEY = 'earnlens.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>('system');

  init(): void {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? 'system';
    this.set(saved);
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.mode() === 'system') {
          this.apply('system');
        }
      });
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem(THEME_KEY, mode);
    this.apply(mode);
  }

  toggle(): void {
    const isDark = document.documentElement.classList.contains('dark');
    this.set(isDark ? 'light' : 'dark');
  }

  private apply(mode: ThemeMode): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = mode === 'dark' || (mode === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
  }
}
