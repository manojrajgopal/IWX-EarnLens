import { Component, signal } from '@angular/core';
import { FAQ_ENTRIES } from '../../data/faq.data';

/* ────────────────────────────────────────────────────────────
   FAQ — the "good to know" branch. An animated accordion that
   answers the first questions a new user tends to have.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-welcome-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  readonly entries = FAQ_ENTRIES;
  readonly openId = signal<string | null>(FAQ_ENTRIES[0]?.id ?? null);

  toggle(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }
}
