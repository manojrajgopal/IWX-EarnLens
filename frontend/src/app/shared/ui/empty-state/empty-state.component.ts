import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center text-center py-12 px-6">
      <div class="text-4xl mb-3 opacity-70">{{ icon() }}</div>
      <h3 class="font-serif text-xl font-semibold mb-1">{{ title() }}</h3>
      <p class="text-secondary text-sm max-w-sm">{{ message() }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<string>('📭');
  readonly title = input<string>('Nothing here yet');
  readonly message = input<string>('');
}
