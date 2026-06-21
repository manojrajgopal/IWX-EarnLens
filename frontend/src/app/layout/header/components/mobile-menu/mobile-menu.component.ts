import { Component, output, signal } from '@angular/core';
import { HEADER_NAV } from '../../data/nav.data';
import { NavGroup } from '../../models/nav.model';
import { MobileNavItemComponent } from './mobile-nav-item/mobile-nav-item.component';

/**
 * Mobile drawer: hamburger button + slide-in panel containing the
 * full recursive nav as a vertical accordion. Shown below 1024px.
 */
@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [MobileNavItemComponent],
  template: `
    <button class="mm__toggle" type="button" (click)="openDrawer()" aria-label="Open menu">
      <span class="mm__bars"></span>
    </button>

    @if (open()) {
      <div class="mm__overlay" (click)="close()">
        <aside class="mm__drawer" (click)="$event.stopPropagation()">
          <div class="mm__head">
            <span class="mm__title">Menu</span>
            <button class="mm__close" type="button" (click)="close()" aria-label="Close menu">✕</button>
          </div>
          <nav class="mm__nav">
            @for (group of groups; track group.title) {
              <div class="mm__group">
                <span class="mm__group-title">{{ group.title }}</span>
                @for (node of group.nodes; track node.label) {
                  <app-mobile-nav-item [node]="node" (navigate)="close()" />
                }
              </div>
            }
          </nav>
        </aside>
      </div>
    }
  `,
  styleUrl: './mobile-menu.component.css',
})
export class MobileMenuComponent {
  readonly groups: NavGroup[] = HEADER_NAV;
  readonly open = signal(false);
  readonly navigate = output<void>();

  openDrawer(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }
}
