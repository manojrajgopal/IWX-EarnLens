import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';

/** Cinematic page header for legal pages. */
@Component({
  selector: 'app-legal-header',
  standalone: true,
  template: `
    <div class="lh">
      <button class="lh__back" type="button" (click)="goBack()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="lh__text">
        <h1 class="lh__title">{{ title() }}</h1>
        <p class="lh__meta">Last updated: {{ lastUpdated() }} · Version {{ version() }}</p>
      </div>
    </div>
    <div class="lh__divider"></div>
  `,
  styles: [`
    .lh {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .lh__back {
      display: grid;
      place-items: center;
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
    }
    .lh__back:hover {
      border-color: var(--accent, #6366f1);
      color: var(--accent, #6366f1);
      transform: translateX(-3px);
      box-shadow: 4px 0 12px -4px rgba(99, 102, 241, 0.25);
    }
    .lh__back svg { width: 1.1rem; height: 1.1rem; }
    .lh__text { flex: 1; }
    .lh__title {
      font-family: var(--font-serif, serif);
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 800;
      margin: 0;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .lh__meta {
      font-size: 0.78rem;
      color: var(--text-tertiary, #9ca3af);
      margin: 0.3rem 0 0;
      letter-spacing: 0.01em;
    }
    .lh__divider {
      margin-top: 1.5rem;
      height: 1px;
      background: linear-gradient(90deg, var(--accent, #6366f1) 0%, var(--border-color, rgba(255,255,255,0.1)) 30%, transparent 100%);
      opacity: 0.6;
    }
  `],
})
export class LegalHeaderComponent {
  private readonly location = inject(Location);

  readonly title = input.required<string>();
  readonly lastUpdated = input('');
  readonly version = input('');

  goBack(): void {
    this.location.back();
  }
}
