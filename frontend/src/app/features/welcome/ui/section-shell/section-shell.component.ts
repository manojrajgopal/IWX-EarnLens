import { Component, input } from '@angular/core';

/* ────────────────────────────────────────────────────────────
   Section shell — a consistent editorial header (eyebrow, serif
   title, subtitle) with projected content beneath. Every branch
   of the welcome tree wears this so the page feels like one work.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-section-shell',
  standalone: true,
  template: `
    <section class="wsec">
      <header class="wsec__head">
        @if (eyebrow()) {
          <span class="wsec__eyebrow">
            <span class="wsec__eyebrow-dot"></span>
            {{ eyebrow() }}
          </span>
        }
        <h2 class="wsec__title">{{ title() }}</h2>
        @if (subtitle()) {
          <p class="wsec__subtitle">{{ subtitle() }}</p>
        }
      </header>
      <div class="wsec__body">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .wsec {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        padding: clamp(3rem, 7vw, 6rem) clamp(1rem, 3vw, 2.5rem);
      }
      .wsec__head {
        max-width: 720px;
        margin: 0 auto clamp(2rem, 4vw, 3.25rem);
        text-align: center;
      }
      .wsec__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 1rem;
      }
      .wsec__eyebrow-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 999px;
        background: var(--accent);
        animation: wsecPulse 2.4s ease-in-out infinite;
      }
      .wsec__title {
        font-family: var(--font-serif);
        font-weight: 700;
        font-size: clamp(1.85rem, 4.5vw, 3rem);
        line-height: 1.08;
        letter-spacing: -0.01em;
        margin: 0;
      }
      .wsec__subtitle {
        margin: 1rem auto 0;
        max-width: 580px;
        color: var(--text-secondary);
        font-size: clamp(0.98rem, 1.6vw, 1.12rem);
        line-height: 1.65;
      }
      @keyframes wsecPulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.7);
          opacity: 0.45;
        }
      }
    `,
  ],
})
export class SectionShellComponent {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
