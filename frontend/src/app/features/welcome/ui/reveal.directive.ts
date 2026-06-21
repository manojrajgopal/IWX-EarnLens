import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';

/* ────────────────────────────────────────────────────────────
   Reveal directive — gives any element a cinematic entrance the
   first time it scrolls into view. Pure IntersectionObserver,
   no dependencies. Optional [revealDelay] staggers siblings.
   ──────────────────────────────────────────────────────────── */

@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: {
    class: 'reveal',
  },
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Delay in ms before the element animates in (for staggering). */
  readonly revealDelay = input<number>(0);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    node.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('reveal--in');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('reveal--in');
            this.observer?.unobserve(node);
          }
        }
      },
      { threshold: 0.12 },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
