import { Component } from '@angular/core';
import { NAVIGATION_MAP } from '../../data/navigation-map.data';
import { NavTileComponent } from '../../ui/nav-tile/nav-tile.component';
import { RevealDirective } from '../../ui/reveal.directive';

/* ────────────────────────────────────────────────────────────
   Navigator — the "go anywhere" branch. Renders the full
   navigation map: clusters (branches) of destination tiles
   (leaves) so the welcome page reaches every corner of the app.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-navigator',
  standalone: true,
  imports: [NavTileComponent, RevealDirective],
  templateUrl: './navigator.component.html',
  styleUrl: './navigator.component.css',
})
export class NavigatorComponent {
  readonly clusters = NAVIGATION_MAP;
}
