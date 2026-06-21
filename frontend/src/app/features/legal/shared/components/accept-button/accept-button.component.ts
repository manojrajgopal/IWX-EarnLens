import { Component, output } from '@angular/core';

/** Cinematic accept button with glow animation. */
@Component({
  selector: 'app-accept-button',
  standalone: true,
  template: `
    <div class="ab">
      <button type="button" class="ab__btn" (click)="accepted.emit()">
        <span class="ab__glow"></span>
        <span class="ab__content">
          <svg class="ab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          I Accept
        </span>
      </button>
    </div>
  `,
  styles: [`
    .ab {
      position: sticky;
      bottom: 0;
      padding: 1.5rem 0;
      background: linear-gradient(to top, var(--bg-base, #0a0a0a) 50%, transparent);
      display: flex;
      justify-content: center;
      z-index: 10;
    }
    .ab__btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem 2.8rem;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border: none;
      border-radius: 999px;
      background: var(--accent, #6366f1);
      color: #000;
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow:
        0 4px 16px -4px rgba(99, 102, 241, 0.5),
        0 0 0 1px rgba(99, 102, 241, 0.2);
    }
    .ab__btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow:
        0 8px 28px -6px rgba(99, 102, 241, 0.6),
        0 0 0 1px rgba(99, 102, 241, 0.3);
    }
    .ab__btn:active {
      transform: translateY(0) scale(0.98);
    }
    .ab__content {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .ab__icon {
      width: 1rem;
      height: 1rem;
    }
    .ab__glow {
      position: absolute;
      inset: -2px;
      border-radius: 999px;
      background: conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 10%, transparent 20%);
      animation: ab-spin 3s linear infinite;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .ab__btn:hover .ab__glow {
      opacity: 1;
    }
    @keyframes ab-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class AcceptButtonComponent {
  readonly accepted = output<void>();
}
