import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  signal,
} from '@angular/core';
import { PulseMetric } from '../../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Metric chip — a leaf of the user-pulse branch. Shows a single
   NON-sensitive engagement count that animates up when scrolled
   into view. Never renders money or graphs.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-metric-chip',
  standalone: true,
  template: `
    <div class="mchip" [style.--mc-accent]="metric().accent">
      <div class="mchip__icon" aria-hidden="true">{{ metric().icon }}</div>
      <div class="mchip__value">{{ display() }}</div>
      <div class="mchip__label">{{ metric().label }}</div>
      <div class="mchip__hint">{{ metric().hint }}</div>
    </div>
  `,
  styles: [
    `
      .mchip {
        position: relative;
        padding: 1.4rem 1.25rem;
        border-radius: var(--r-lg);
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        box-shadow: var(--shadow-card);
        overflow: hidden;
        transition: transform 0.26s ease, border-color 0.26s ease;
      }
      .mchip::after {
        content: '';
        position: absolute;
        inset: auto -30% -60% auto;
        width: 9rem;
        height: 9rem;
        border-radius: 999px;
        background: radial-gradient(
          circle,
          color-mix(in srgb, var(--mc-accent) 22%, transparent),
          transparent 70%
        );
        opacity: 0.6;
      }
      .mchip:hover {
        transform: translateY(-4px);
        border-color: color-mix(in srgb, var(--mc-accent) 45%, var(--border-color));
      }
      .mchip__icon {
        width: 2.5rem;
        height: 2.5rem;
        display: grid;
        place-items: center;
        font-size: 1.15rem;
        border-radius: 0.75rem;
        margin-bottom: 0.85rem;
        color: var(--mc-accent);
        background: color-mix(in srgb, var(--mc-accent) 14%, transparent);
      }
      .mchip__value {
        font-family: var(--font-mono);
        font-size: clamp(1.8rem, 4vw, 2.4rem);
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.02em;
      }
      .mchip__label {
        margin-top: 0.5rem;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .mchip__hint {
        margin-top: 0.2rem;
        font-size: 0.78rem;
        color: var(--text-muted);
      }
    `,
  ],
})
export class MetricChipComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly metric = input.required<PulseMetric>();
  readonly display = signal('0');

  private observer?: IntersectionObserver;
  private rafId = 0;

  ngAfterViewInit(): void {
    const target = this.metric().value;
    if (typeof IntersectionObserver === 'undefined') {
      this.display.set(String(target));
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.countUp(target);
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  private countUp(target: number): void {
    const duration = 900;
    const start = performance.now();
    const tick = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.display.set(String(Math.round(target * eased)));
      if (progress < 1) {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.rafId);
  }
}
