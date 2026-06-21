import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_GROUPS } from '../nav.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="side h-full flex flex-col">
      <a routerLink="/app/dashboard" class="brand">
        <span class="brand-mark">◆</span>
        <span class="brand-name">EarnLens</span>
      </a>

      <nav class="flex-1 overflow-y-auto px-3 py-2">
        @for (group of groups; track group.title) {
          <p class="nav-group-title">{{ group.title }}</p>
          <ul class="mb-4">
            @for (item of group.items; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="nav-active"
                  class="nav-link"
                  (click)="navigate.emit()"
                >
                  <span class="nav-icon">{{ item.icon }}</span>
                  <span>{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        }
      </nav>

      <div class="px-4 py-3 text-xs text-muted border-t border-[var(--border-color)]">
        IWX · EarnLens
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly navigate = output<void>();
  readonly groups = NAV_GROUPS;
}
