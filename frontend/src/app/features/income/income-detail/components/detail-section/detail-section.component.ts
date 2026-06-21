import { Component, input } from '@angular/core';

import { DetailSection } from '../../models/detail-field.model';
import { DetailFieldComponent } from '../detail-field/detail-field.component';

/** A titled card grouping a set of related detail fields. */
@Component({
  selector: 'app-detail-section',
  standalone: true,
  imports: [DetailFieldComponent],
  template: `
    <section class="ds card">
      <header class="ds__head">
        <span class="ds__icon">{{ section().icon }}</span>
        <h3 class="ds__title">{{ section().title }}</h3>
      </header>
      <dl class="ds__body">
        @for (field of section().fields; track field.label) {
          <app-detail-field [field]="field" />
        }
      </dl>
    </section>
  `,
  styleUrl: './detail-section.component.css',
})
export class DetailSectionComponent {
  readonly section = input.required<DetailSection>();
}
