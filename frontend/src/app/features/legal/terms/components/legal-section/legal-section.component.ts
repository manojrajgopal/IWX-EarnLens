import { Component, input } from '@angular/core';
import { LegalSection } from '../../content/terms-sections';

/** Renders a single legal content section with cinematic card styling. */
@Component({
  selector: 'app-legal-section',
  standalone: true,
  template: `
    <section class="ls" [id]="section().id">
      <div class="ls__header">
        <span class="ls__number">{{ index() }}</span>
        <h3 class="ls__title">{{ section().title }}</h3>
      </div>
      @for (p of section().body; track $index) {
        <p class="ls__body">{{ p }}</p>
      }
      <div class="ls__line"></div>
    </section>
  `,
  styles: [`
    .ls {
      position: relative;
      margin-bottom: 2.5rem;
      padding: 1.75rem 2rem;
      border-radius: 16px;
      background: var(--bg-surface, rgba(255, 255, 255, 0.02));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .ls:hover {
      border-color: var(--accent, #6366f1);
      box-shadow: 0 0 30px -10px rgba(99, 102, 241, 0.12);
    }
    .ls__header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1rem;
    }
    .ls__number {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: 8px;
      background: var(--accent, #6366f1);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .ls__title {
      font-family: var(--font-serif, serif);
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }
    .ls__body {
      font-size: 0.9rem;
      line-height: 1.8;
      color: var(--text-secondary);
      margin: 0 0 0.75rem;
      padding-left: 2.85rem;
    }
    .ls__line {
      position: absolute;
      bottom: -1.25rem;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--border-color, rgba(255,255,255,0.1)), transparent);
    }
    .ls:last-child .ls__line { display: none; }
  `],
})
export class LegalSectionComponent {
  readonly section = input.required<LegalSection>();
  readonly index = input(0);
}
