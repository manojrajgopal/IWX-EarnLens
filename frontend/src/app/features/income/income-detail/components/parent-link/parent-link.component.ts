import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Banner shown on a child occurrence that links back to its series template. */
@Component({
  selector: 'app-parent-link',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="pl" [routerLink]="['/app/income', parentId()]">
      <span class="pl__icon">↥</span>
      <span class="pl__text">
        <span class="pl__label">Part of a recurring series</span>
        <span class="pl__hint">View the parent template & all occurrences</span>
      </span>
      <span class="pl__chev">→</span>
    </a>
  `,
  styleUrl: './parent-link.component.css',
})
export class ParentLinkComponent {
  readonly parentId = input.required<string>();
}
