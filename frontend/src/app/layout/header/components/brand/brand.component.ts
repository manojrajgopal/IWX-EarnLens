import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/app/dashboard" class="brand">
      <span class="brand__mark">◆</span>
      <span class="brand__name">EarnLens</span>
    </a>
  `,
  styles: [
    `
      .brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: inherit;
        flex-shrink: 0;
      }
      .brand__mark {
        font-size: 1.3rem;
        color: var(--accent);
      }
      .brand__name {
        font-family: var(--font-serif);
        font-size: 1.3rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
    `,
  ],
})
export class BrandComponent {}
