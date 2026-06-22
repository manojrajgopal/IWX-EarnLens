import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PulseMetric } from '../../models/welcome.types';
import { MetricChipComponent } from '../../ui/metric-chip/metric-chip.component';

/* ────────────────────────────────────────────────────────────
   User pulse — the "about you" branch. A warm identity card plus
   NON-sensitive engagement counts (entries, categories, sources,
   tags, streams). Deliberately never shows money or graphs.
   ──────────────────────────────────────────────────────────── */

@Component({
  selector: 'app-user-pulse',
  standalone: true,
  imports: [RouterLink, MetricChipComponent],
  templateUrl: './user-pulse.component.html',
  styleUrl: './user-pulse.component.css',
})
export class UserPulseComponent {
  readonly fullName = input<string>('');
  readonly username = input<string>('');
  readonly email = input<string>('');
  readonly currency = input<string>('');
  readonly memberSince = input<string>('');
  readonly role = input<string>('user');
  readonly initials = input<string>('?');
  readonly avatarUrl = input<string | null>(null);
  readonly loading = input<boolean>(false);
  readonly metrics = input<PulseMetric[]>([]);
}
