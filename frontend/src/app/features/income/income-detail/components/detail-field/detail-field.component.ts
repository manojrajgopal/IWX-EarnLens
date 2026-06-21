import { Component, input } from '@angular/core';

import { DetailField } from '../../models/detail-field.model';

/** A single label / value row inside a detail section. */
@Component({
  selector: 'app-detail-field',
  standalone: true,
  template: `
    <div class="df">
      <dt class="df__label">{{ field().label }}</dt>
      <dd class="df__value" [attr.data-kind]="field().kind ?? 'text'">
        {{ field().value }}
      </dd>
    </div>
  `,
  styleUrl: './detail-field.component.css',
})
export class DetailFieldComponent {
  readonly field = input.required<DetailField>();
}
