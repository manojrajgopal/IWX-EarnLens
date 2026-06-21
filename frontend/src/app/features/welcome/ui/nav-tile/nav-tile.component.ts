import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavTile } from '../../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Nav tile — a leaf of the navigation hub. A compact, animated
   doorway to a single destination inside EarnLens.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-nav-tile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav-tile.component.html',
  styleUrl: './nav-tile.component.css',
})
export class NavTileComponent {
  readonly tile = input.required<NavTile>();
}
