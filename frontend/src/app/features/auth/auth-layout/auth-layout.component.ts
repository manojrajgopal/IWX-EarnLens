import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen grid lg:grid-cols-2">
      <!-- brand panel -->
      <div class="auth-aside hidden lg:flex">
        <div class="relative z-10 flex flex-col h-full p-12">
          <a routerLink="/" class="flex items-center gap-2 text-white">
            <span class="text-2xl">◆</span>
            <span class="font-serif text-2xl font-bold">EarnLens</span>
          </a>
          <div class="mt-auto">
            <h2 class="font-serif text-4xl font-bold text-white leading-tight">
              Clarity for every<br />dollar you earn.
            </h2>
            <p class="text-white/70 mt-4 max-w-md">
              Track, categorize and analyze your income streams with a calm, focused workspace
              built for people who care about the details.
            </p>
          </div>
          <div class="mt-10 flex gap-8 text-white/80">
            <div>
              <p class="text-2xl font-bold text-white">Multi-source</p>
              <p class="text-sm">income tracking</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">Live</p>
              <p class="text-sm">analytics & trends</p>
            </div>
          </div>
        </div>
      </div>

      <!-- form panel -->
      <div class="flex items-center justify-center p-6 sm:p-10 bg-[var(--bg-page)]">
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-aside {
        position: relative;
        background: #0a0a0a;
        overflow: hidden;
      }
      .auth-aside::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.08), transparent 42%),
          radial-gradient(circle at 8% 92%, rgba(255, 255, 255, 0.05), transparent 38%),
          repeating-linear-gradient(135deg, transparent 0 22px, rgba(255, 255, 255, 0.018) 22px 23px);
      }
    `,
  ],
})
export class AuthLayoutComponent {}
