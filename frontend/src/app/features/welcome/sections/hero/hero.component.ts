import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/* ────────────────────────────────────────────────────────────
   Hero — the opening frame. A warm, personal welcome that names
   the user, sets the cinematic tone with floating orbs and an
   animated aurora, and offers the two primary doorways.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-welcome-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  readonly userName = input<string>('there');
  readonly greeting = input<string>('Welcome');
  readonly memberSince = input<string>('');
  readonly avatarUrl = input<string | null>(null);
  readonly initials = input<string>('?');

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
