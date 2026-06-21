import { Component, output, signal } from '@angular/core';
import { HEADER_NAV } from '../../data/nav.data';
import { NavGroup } from '../../models/nav.model';
import { NavDropdownComponent } from './nav-dropdown/nav-dropdown.component';

/**
 * Centered desktop navigation: a horizontal row of top-level
 * dropdowns. Owns the "which group is open" state so only one
 * panel shows at a time. Hidden below 1024px (mobile menu used instead).
 */
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NavDropdownComponent],
  template: `
    <nav class="nav">
      @for (group of groups; track group.title) {
        <app-nav-dropdown
          [group]="group"
          [open]="openGroup() === group.title"
          (toggle)="onToggle($event)"
          (hover)="onHover($event)"
          (leave)="onLeave()"
          (navigate)="onNavigate()"
        />
      }
    </nav>
  `,
  styles: [
    `
      .nav {
        display: none;
        align-items: center;
        gap: 0.25rem;
      }
      @media (min-width: 1024px) {
        .nav {
          display: flex;
        }
      }
    `,
  ],
})
export class NavComponent {
  readonly groups: NavGroup[] = HEADER_NAV;
  readonly openGroup = signal<string | null>(null);
  readonly navigate = output<void>();

  /** Tracks whether the user is hovering so we don't auto-close on leave
   *  when a panel was opened via click. */
  private clicked = false;

  onToggle(title: string): void {
    this.clicked = true;
    this.openGroup.update((cur) => (cur === title ? null : title));
  }

  onHover(title: string): void {
    if (this.openGroup() !== null) {
      this.openGroup.set(title);
    }
  }

  onLeave(): void {
    if (!this.clicked) {
      this.openGroup.set(null);
    }
  }

  onNavigate(): void {
    this.clicked = false;
    this.openGroup.set(null);
    this.navigate.emit();
  }

  close(): void {
    this.clicked = false;
    this.openGroup.set(null);
  }
}
