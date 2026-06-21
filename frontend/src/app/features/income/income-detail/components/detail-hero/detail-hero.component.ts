import { Component, computed, input } from '@angular/core';

import { Income } from '../../../../../core/models/income.model';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { HumanizePipe } from '../../../../../shared/pipes/humanize.pipe';
import { recurrenceLabel } from '../../config/recurrence.config';
import { isOccurrence, isOneTime, isSeriesParent } from '../../utils/income-classify.util';
import { DetailBadgeComponent } from '../detail-badge/detail-badge.component';

/** Cinematic header showing the income's identity, amount and nature. */
@Component({
  selector: 'app-detail-hero',
  standalone: true,
  imports: [MoneyPipe, HumanizePipe, DetailBadgeComponent],
  templateUrl: './detail-hero.component.html',
  styleUrl: './detail-hero.component.css',
})
export class DetailHeroComponent {
  readonly income = input.required<Income>();

  readonly kind = computed(() => {
    const income = this.income();
    if (isSeriesParent(income)) return 'Recurring series';
    if (isOccurrence(income)) return 'Series occurrence';
    if (isOneTime(income)) return 'One-time entry';
    return 'Income entry';
  });

  readonly cadence = computed(() => {
    const income = this.income();
    return isOneTime(income) ? null : recurrenceLabel(income.recurrence);
  });
}
