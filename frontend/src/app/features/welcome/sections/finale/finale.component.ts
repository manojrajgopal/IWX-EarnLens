import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/* ────────────────────────────────────────────────────────────
   Finale — the closing frame. A bold, cinematic call to action
   that sends the user into the product on a high note.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-welcome-finale',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './finale.component.html',
  styleUrl: './finale.component.css',
})
export class FinaleComponent {
  readonly userName = input<string>('there');
}
