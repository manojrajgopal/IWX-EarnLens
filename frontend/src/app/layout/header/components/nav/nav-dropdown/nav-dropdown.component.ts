import { Component, input, output } from '@angular/core';
import { NavGroup } from '../../../models/nav.model';
import { NavItemComponent } from '../nav-item/nav-item.component';

/**
 * A single top-level header entry: a button that toggles a dropdown
 * panel of recursive <app-nav-item> nodes.
 * Open/close is controlled by the parent <app-nav> so only one panel
 * is open at a time.
 */
@Component({
  selector: 'app-nav-dropdown',
  standalone: true,
  imports: [NavItemComponent],
  template: `
    <div
      class="nd"
      (mouseenter)="hover.emit(group().title)"
      (mouseleave)="leave.emit()"
    >
      <button
        class="nd__btn"
        [class.nd__btn--open]="open()"
        type="button"
        (click)="toggle.emit(group().title)"
      >
        @if (group().icon) {
          <span class="nd__icon">{{ group().icon }}</span>
        }
        <span>{{ group().title }}</span>
        <span class="nd__chev">▾</span>
      </button>

      @if (open()) {
        <div class="nd__panel">
          @for (node of group().nodes; track node.label) {
            <app-nav-item [node]="node" (navigate)="navigate.emit()" />
          }
        </div>
      }
    </div>
  `,
  styleUrl: './nav-dropdown.component.css',
})
export class NavDropdownComponent {
  readonly group = input.required<NavGroup>();
  readonly open = input(false);

  readonly toggle = output<string>();
  readonly hover = output<string>();
  readonly leave = output<void>();
  readonly navigate = output<void>();
}
