import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandAsideComponent } from '../shared/brand-aside/brand-aside.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, BrandAsideComponent],
  template: `
    <div class="auth">
      <!-- cinematic brand panel -->
      <div class="auth__aside">
        <app-brand-aside />
      </div>

      <!-- form panel -->
      <div class="auth__panel">
        <div class="auth__panel-glow"></div>
        <div class="auth__form">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth {
        display: grid;
        grid-template-columns: 1fr;
        min-height: 100vh;
        min-height: 100dvh;
        background: var(--bg-page);
      }
      @media (min-width: 1024px) {
        .auth {
          grid-template-columns: 1.05fr 1fr;
        }
      }

      .auth__aside {
        display: none;
      }
      @media (min-width: 1024px) {
        .auth__aside {
          display: block;
        }
      }

      .auth__panel {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        overflow: hidden;
      }
      @media (min-width: 640px) {
        .auth__panel {
          padding: 2.5rem;
        }
      }

      /* soft moving glow so the form side is never empty */
      .auth__panel-glow {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background:
          radial-gradient(38% 30% at 85% 8%, var(--accent-soft), transparent 70%),
          radial-gradient(34% 28% at 10% 92%, var(--accent-soft), transparent 70%);
        opacity: 0.7;
        animation: auth-glow 14s ease-in-out infinite alternate;
      }
      @keyframes auth-glow {
        from {
          transform: translate3d(0, 0, 0) scale(1);
        }
        to {
          transform: translate3d(2%, -2%, 0) scale(1.1);
        }
      }

      .auth__form {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 27rem;
      }

      @media (prefers-reduced-motion: reduce) {
        .auth__panel-glow {
          animation: none;
        }
      }
    `,
  ],
})
export class AuthLayoutComponent {}
