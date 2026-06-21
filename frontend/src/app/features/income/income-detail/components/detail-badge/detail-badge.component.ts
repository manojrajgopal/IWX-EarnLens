import { Component, computed, input } from '@angular/core';

import { IncomeStatus } from '../../../../../core/models/income.model';
import { statusTheme } from '../../config/income-status.config';

/** Status chip tinted by the income status (received / pending / …). */
@Component({
  selector: 'app-detail-badge',
  standalone: true,
  template: `
    <span
      class="db"
      [style.--tone]="'var(' + theme().tone + ')'"
    >
      <span class="db__icon">{{ theme().icon }}</span>
      {{ theme().label }}
    </span>
  `,
  styleUrl: './detail-badge.component.css',
})
export class DetailBadgeComponent {
  readonly status = input.required<IncomeStatus>();
  readonly theme = computed(() => statusTheme(this.status()));
}
