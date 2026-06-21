import { Component } from '@angular/core';

@Component({
  selector: 'app-currency',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="text-6xl mb-6">💱</div>
      <h1 class="font-serif text-3xl font-bold mb-3">Currency Conversion</h1>
      <p class="text-secondary text-lg max-w-md mb-6">
        Auto currency conversion is an upcoming feature. When you record income in a different
        currency, the system will automatically fetch live exchange rates and convert amounts.
      </p>
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm font-medium">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        Available in v2.0
      </div>
    </div>
  `,
})
export class CurrencyComponent {}
