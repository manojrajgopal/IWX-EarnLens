import { Component, input, output } from '@angular/core';
import { UpdateScope, UPDATE_SCOPE_OPTIONS } from '../../engine/models/update-scope.model';

/**
 * Radio-style picker forcing the user to choose how far a recurring-salary
 * edit reaches. Past data is protected — the "all" option is visually marked
 * as destructive.
 */
@Component({
  selector: 'app-scope-selector',
  standalone: true,
  template: `
    <div class="ss">
      <p class="ss__intro">
        This is a <strong>repeating</strong> income. Choose exactly which occurrences your
        change should affect. Already-recorded months are protected unless you explicitly
        choose to rewrite them.
      </p>
      <div class="ss__list">
        @for (opt of options; track opt.value) {
          <button
            type="button"
            class="ss__opt"
            [class.ss__opt--active]="selected() === opt.value"
            [attr.data-severity]="opt.severity"
            (click)="select.emit(opt.value)"
          >
            <span class="ss__icon">{{ opt.icon }}</span>
            <span class="ss__body">
              <span class="ss__label">
                {{ opt.label }}
                @if (opt.severity === 'danger') {
                  <span class="ss__badge">Destructive</span>
                }
              </span>
              <span class="ss__desc">{{ opt.description }}</span>
            </span>
            <span class="ss__radio" [class.ss__radio--on]="selected() === opt.value"></span>
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './scope-selector.component.css',
})
export class ScopeSelectorComponent {
  readonly selected = input<UpdateScope | null>(null);
  readonly select = output<UpdateScope>();
  protected readonly options = UPDATE_SCOPE_OPTIONS;
}
