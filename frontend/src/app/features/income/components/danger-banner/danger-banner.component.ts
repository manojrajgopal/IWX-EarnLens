import { Component, input } from '@angular/core';

/**
 * A high-visibility warning banner shown at the top of the restricted edit
 * page. Its colour intensifies with the danger level so the user always knows
 * they are in a sensitive area.
 */
@Component({
  selector: 'app-danger-banner',
  standalone: true,
  template: `
    <div class="db" [attr.data-level]="level()">
      <span class="db__icon">{{ icon() }}</span>
      <div class="db__text">
        <p class="db__title">{{ title() }}</p>
        <p class="db__message">{{ message() }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .db {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        padding: 0.9rem 1.1rem;
        border-radius: var(--r-sm);
        border: 1px solid;
        margin-bottom: 1.25rem;
        animation: db-in 0.25s ease;
      }
      .db[data-level='info'] {
        background: var(--accent-soft);
        border-color: color-mix(in srgb, var(--accent, #6366f1) 35%, transparent);
      }
      .db[data-level='caution'] {
        background: color-mix(in srgb, #f59e0b 12%, transparent);
        border-color: color-mix(in srgb, #f59e0b 45%, transparent);
      }
      .db[data-level='danger'] {
        background: color-mix(in srgb, var(--negative) 12%, transparent);
        border-color: color-mix(in srgb, var(--negative) 50%, transparent);
      }
      .db__icon {
        flex-shrink: 0;
        font-size: 1.25rem;
        line-height: 1.4;
      }
      .db[data-level='danger'] .db__icon {
        color: var(--negative);
      }
      .db[data-level='caution'] .db__icon {
        color: #f59e0b;
      }
      .db__title {
        font-weight: 700;
        font-size: 0.92rem;
        margin-bottom: 0.15rem;
      }
      .db__message {
        font-size: 0.84rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      @keyframes db-in {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
      }
    `,
  ],
})
export class DangerBannerComponent {
  readonly level = input<'info' | 'caution' | 'danger'>('danger');
  readonly icon = input('⚠');
  readonly title = input('Restricted area');
  readonly message = input('');
}
