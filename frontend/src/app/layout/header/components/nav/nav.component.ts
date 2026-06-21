import { Component, ElementRef, HostListener, output, signal, viewChild } from '@angular/core';
import { HEADER_NAV } from '../../data/nav.data';
import { NavGroup } from '../../models/nav.model';
import { NavDropdownComponent } from './nav-dropdown/nav-dropdown.component';

/**
 * Centered desktop navigation: a horizontal row of top-level
 * dropdowns. Click-based: click to open/close. When a panel is already
 * open, hovering another top-level button switches to it. Clicking
 * anywhere outside the nav closes everything.
 */
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NavDropdownComponent],
  template: `
    <nav class="nav" #navEl>
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
  private readonly navEl = viewChild<ElementRef<HTMLElement>>('navEl');
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  /** Click a top-level button: toggle that panel. */
  onToggle(title: string): void {
    this.clearLeaveTimer();
    this.openGroup.update((cur) => (cur === title ? null : title));
  }

  /** Hover a top-level button: open it immediately. */
  onHover(title: string): void {
    this.clearLeaveTimer();
    this.openGroup.set(title);
  }

  /** Mouse leaves a dropdown area: close after a short delay. */
  onLeave(): void {
    this.clearLeaveTimer();
    this.leaveTimer = setTimeout(() => this.openGroup.set(null), 150);
  }

  onNavigate(): void {
    this.clearLeaveTimer();
    this.openGroup.set(null);
    this.navigate.emit();
  }

  close(): void {
    this.clearLeaveTimer();
    this.openGroup.set(null);
  }

  private clearLeaveTimer(): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  }

  /** Click anywhere outside the <nav> element → close all dropdowns. */
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const el = this.navEl()?.nativeElement;
    if (el && !el.contains(e.target as Node)) {
      this.openGroup.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openGroup.set(null);
  }
}
