import { Component } from '@angular/core';
import { FEATURE_CATALOG } from '../../data/feature-catalog.data';
import { FeatureCardComponent } from '../../ui/feature-card/feature-card.component';
import { RevealDirective } from '../../ui/reveal.directive';

/* ────────────────────────────────────────────────────────────
   Feature showcase — the "what it does" branch. Renders the
   feature catalogue as a staggered, revealing grid of cards.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-feature-showcase',
  standalone: true,
  imports: [FeatureCardComponent, RevealDirective],
  template: `
    <div class="showcase">
      @for (feature of features; track feature.id; let i = $index) {
        <div appReveal [revealDelay]="i * 80">
          <app-feature-card [feature]="feature" />
        </div>
      }
    </div>
  `,
  styles: [
    `
      .showcase {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
      }
      .showcase > * {
        display: flex;
      }
      .showcase app-feature-card {
        width: 100%;
        display: flex;
      }
    `,
  ],
})
export class FeatureShowcaseComponent {
  readonly features = FEATURE_CATALOG;
}
