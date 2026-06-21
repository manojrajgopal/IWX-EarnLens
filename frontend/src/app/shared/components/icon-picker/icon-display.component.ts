import { Component, input } from '@angular/core';
import { ICON_MAP } from './icon-registry';

/**
 * Renders a single icon from the registry by its id.
 * Falls back to a hexagon placeholder when the id is not found or empty.
 */
@Component({
  selector: 'app-icon-display',
  standalone: true,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path [attr.d]="pathData()" />
    </svg>
  `,
  styles: [`:host { display: inline-flex; align-items: center; justify-content: center; }`],
})
export class IconDisplayComponent {
  readonly icon = input<string | null | undefined>(null);
  readonly size = input<string | number>('1.25rem');

  protected pathData(): string {
    const id = this.icon();
    if (!id) return FALLBACK;
    return ICON_MAP.get(id)?.path ?? FALLBACK;
  }
}

const FALLBACK =
  'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z';
