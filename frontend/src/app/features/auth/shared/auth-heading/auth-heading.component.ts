import { Component, input } from '@angular/core';

/** Animated page heading for auth screens (staggered reveal). */
@Component({
  selector: 'app-auth-heading',
  standalone: true,
  template: `
    <div class="ah">
      <div class="ah__kicker">
        <span class="ah__dot"></span>
        <span>{{ kicker() }}</span>
      </div>
      <h1 class="ah__title">{{ title() }}</h1>
      <p class="ah__subtitle">{{ subtitle() }}</p>
    </div>
  `,
  styles: [
    `
      .ah {
        margin-bottom: 1.75rem;
      }
      .ah__kicker {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.66rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--text-muted);
        margin-bottom: 0.9rem;
        opacity: 0;
        animation: ah-rise 0.55s ease 0.05s forwards;
      }
      .ah__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
        animation: ah-pulse 2s ease-in-out infinite;
      }
      .ah__title {
        font-family: var(--font-serif);
        font-size: clamp(2rem, 4vw, 2.6rem);
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin: 0 0 0.6rem;
        opacity: 0;
        animation: ah-rise 0.6s ease 0.12s forwards;
      }
      .ah__subtitle {
        color: var(--text-secondary);
        font-size: 0.95rem;
        margin: 0;
        opacity: 0;
        animation: ah-rise 0.6s ease 0.2s forwards;
      }
      @keyframes ah-rise {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes ah-pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.6);
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class AuthHeadingComponent {
  readonly kicker = input('EarnLens');
  readonly title = input('');
  readonly subtitle = input('');
}
