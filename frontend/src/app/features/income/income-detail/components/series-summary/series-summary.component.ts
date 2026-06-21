import { Component, computed, input } from '@angular/core';

import { SeriesSummary } from '../../../../../core/models/income.model';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { formatDate, formatDateTime } from '../../utils/detail-format.util';

/** Roll-up strip summarising a recurring series (totals, span, next run). */
@Component({
  selector: 'app-series-summary',
  standalone: true,
  imports: [MoneyPipe],
  templateUrl: './series-summary.component.html',
  styleUrl: './series-summary.component.css',
})
export class SeriesSummaryComponent {
  readonly summary = input.required<SeriesSummary>();

  readonly span = computed(() => {
    const s = this.summary();
    if (!s.first_date && !s.last_date) return '—';
    return `${formatDate(s.first_date)} → ${formatDate(s.last_date)}`;
  });

  readonly nextRun = computed(() => formatDateTime(this.summary().next_run_at));
}
