import { Component } from '@angular/core';
import { VALUE_PILLARS } from '../../data/pillars.data';
import { RevealDirective } from '../../ui/reveal.directive';

/* ────────────────────────────────────────────────────────────
   Why EarnLens — the "why it matters" branch. Pure motivation,
   rendered as four glowing value pillars.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-why-earnlens',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <div class="why">
      @for (pillar of pillars; track pillar.id; let i = $index) {
        <article class="why__card" appReveal [revealDelay]="i * 90">
          <span class="why__glow" aria-hidden="true"></span>
          <span class="why__icon" aria-hidden="true">{{ pillar.icon }}</span>
          <h3 class="why__title">{{ pillar.title }}</h3>
          <p class="why__desc">{{ pillar.description }}</p>
        </article>
      }
    </div>
  `,
  styleUrl: './why-earnlens.component.css',
})
export class WhyEarnlensComponent {
  readonly pillars = VALUE_PILLARS;
}
