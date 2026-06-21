import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Income } from '../../../../../core/models/income.model';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { statusTheme } from '../../config/income-status.config';
import { formatDate } from '../../utils/detail-format.util';

/** One clickable occurrence inside the series occurrences list. */
@Component({
  selector: 'app-occurrence-row',
  standalone: true,
  imports: [RouterLink, MoneyPipe],
  templateUrl: './occurrence-row.component.html',
  styleUrl: './occurrence-row.component.css',
})
export class OccurrenceRowComponent {
  readonly occurrence = input.required<Income>();
  /** Marks the row representing the income currently being viewed. */
  readonly active = input(false);
  /** Position label (e.g. running index) shown as a leading marker. */
  readonly index = input<number | null>(null);

  readonly date = computed(() => formatDate(this.occurrence().payment_date));
  readonly tone = computed(() => statusTheme(this.occurrence().status));
  readonly isTemplate = computed(() => !this.occurrence().is_auto_generated);
}
