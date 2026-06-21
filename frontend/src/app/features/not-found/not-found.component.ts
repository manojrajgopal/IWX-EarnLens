import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--bg-page)]">
      <div class="animate-in">
        <p class="font-serif text-7xl font-bold text-[var(--accent)]">404</p>
        <h1 class="font-serif text-3xl font-bold mt-4 mb-2">Page not found</h1>
        <p class="text-secondary mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has moved.
        </p>
        <a routerLink="/app/welcome" class="btn btn-primary">Back to home</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
