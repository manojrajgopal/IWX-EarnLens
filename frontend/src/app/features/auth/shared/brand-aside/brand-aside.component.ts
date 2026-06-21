import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Cinematic left panel for the auth layout. Animated aurora gradient,
 * drifting particles, a rotating headline word and live-feel stats —
 * a "short movie" backdrop for the sign-in / register forms.
 */
@Component({
  selector: 'app-brand-aside',
  standalone: true,
  imports: [RouterLink],
  template: `
    <aside class="ba">
      <div class="ba__aurora"></div>
      <div class="ba__grid"></div>
      <div class="ba__particles">
        @for (p of particles; track p) {
          <span class="ba__particle" [style]="p"></span>
        }
      </div>

      <div class="ba__content">
        <a routerLink="/" class="ba__brand">
          <span class="ba__brand-mark">◆</span>
          <span class="ba__brand-name">EarnLens</span>
        </a>

        <div class="ba__mid">
          <h2 class="ba__headline">
            Clarity for every<br />
            <span class="ba__rotator">
              @for (w of words; track w; let i = $index) {
                <span class="ba__word" [class.ba__word--active]="i === wordIndex()">{{ w }}</span>
              }
            </span>
          </h2>
          <p class="ba__lede">
            Track, categorize and analyze your income streams with a calm, focused workspace
            built for people who care about the details.
          </p>
        </div>

        <div class="ba__stats">
          @for (s of stats; track s.label) {
            <div class="ba__stat">
              <span class="ba__stat-value">{{ s.value }}</span>
              <span class="ba__stat-label">{{ s.label }}</span>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
  styleUrl: './brand-aside.component.css',
})
export class BrandAsideComponent implements OnInit, OnDestroy {
  readonly words = ['dollar you earn.', 'stream you build.', 'goal you chase.', 'move you make.'];
  readonly wordIndex = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  readonly stats = [
    { value: 'Multi-source', label: 'income tracking' },
    { value: 'Live', label: 'analytics & trends' },
    { value: 'Private', label: 'by design' },
  ];

  readonly particles: string[] = Array.from({ length: 18 }, () => {
    const left = Math.random() * 100;
    const size = 2 + Math.random() * 4;
    const delay = Math.random() * 12;
    const duration = 10 + Math.random() * 14;
    const opacity = 0.15 + Math.random() * 0.5;
    return `left:${left}%;width:${size}px;height:${size}px;animation-delay:-${delay}s;animation-duration:${duration}s;opacity:${opacity};`;
  });

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.wordIndex.update((i) => (i + 1) % this.words.length);
    }, 2600);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
