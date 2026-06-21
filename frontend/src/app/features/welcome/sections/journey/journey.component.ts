import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JOURNEY_STEPS } from '../../data/journey.data';
import { RevealDirective } from '../../ui/reveal.directive';

/* ────────────────────────────────────────────────────────────
   Journey — the "how to use it" branch. A vertical cinematic
   timeline that reveals step by step as you scroll.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  templateUrl: './journey.component.html',
  styleUrl: './journey.component.css',
})
export class JourneyComponent {
  readonly steps = JOURNEY_STEPS;
}
