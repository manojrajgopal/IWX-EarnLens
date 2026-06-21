import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavNode } from '../../../models/nav.model';

/**
 * Recursive mobile (vertical, accordion) navigation item.
 * Branches expand/collapse inline with progressive indentation.
 */
@Component({
  selector: 'app-mobile-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MobileNavItemComponent],
  template: `
    <div class="mni" [style.--depth]="depth()">
      @if (hasChildren()) {
        <button class="mni__row" type="button" (click)="toggle()" [class.mni__row--open]="open()">
          @if (node().icon) {
            <span class="mni__icon">{{ node().icon }}</span>
          }
          <span class="mni__label">
            {{ node().label }}
            @if (node().badge) {
              <span class="mni__badge">{{ node().badge }}</span>
            }
          </span>
          <span class="mni__chev">{{ open() ? '▾' : '▸' }}</span>
        </button>

        @if (open()) {
          <div class="mni__children">
            @if (node().path) {
              <a
                class="mni__row mni__row--open-link"
                [routerLink]="node().path"
                (click)="navigate.emit()"
              >
                <span class="mni__icon">↵</span>
                <span class="mni__label">Open {{ node().label }}</span>
              </a>
            }
            @for (child of node().children; track child.label) {
              <app-mobile-nav-item
                [node]="child"
                [depth]="depth() + 1"
                (navigate)="navigate.emit()"
              />
            }
          </div>
        }
      } @else {
        <a
          class="mni__row"
          [routerLink]="node().path"
          routerLinkActive="mni__row--active"
          (click)="navigate.emit()"
        >
          @if (node().icon) {
            <span class="mni__icon">{{ node().icon }}</span>
          }
          <span class="mni__label">
            {{ node().label }}
            @if (node().badge) {
              <span class="mni__badge">{{ node().badge }}</span>
            }
          </span>
        </a>
      }
    </div>
  `,
  styleUrl: './mobile-nav-item.component.css',
})
export class MobileNavItemComponent {
  readonly node = input.required<NavNode>();
  readonly depth = input(0);
  readonly navigate = output<void>();

  readonly open = signal(false);

  hasChildren(): boolean {
    return !!this.node().children?.length;
  }

  toggle(): void {
    this.open.update((v) => !v);
  }
}
