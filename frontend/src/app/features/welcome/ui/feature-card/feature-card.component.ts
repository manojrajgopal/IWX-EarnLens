import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureNode } from '../../models/welcome.types';

/* ────────────────────────────────────────────────────────────
   Feature card — a leaf of the showcase branch. Animated icon
   halo, hover glow keyed to the feature accent, and a deep link
   so every card is also a doorway into the product.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.css',
})
export class FeatureCardComponent {
  readonly feature = input.required<FeatureNode>();
}
