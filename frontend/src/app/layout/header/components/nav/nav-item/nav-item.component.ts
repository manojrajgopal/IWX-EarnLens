import {
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavNode } from '../../../models/nav.model';

/**
 * Recursive navigation item.
 * - A leaf (no children) renders a link.
 * - A branch renders a row that opens a nested flyout containing
 *   more <app-nav-item> elements — to any depth.
 */
@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NavItemComponent],
  template: `
    <div
      class="ni"
      (mouseenter)="onEnter()"
      (mouseleave)="onLeave()"
    >
      @if (hasChildren()) {
        <button
          class="ni__row"
          [class.ni__row--open]="open()"
          (click)="toggle()"
          type="button"
        >
          @if (node().icon) {
            <span class="ni__icon">{{ node().icon }}</span>
          }
          <span class="ni__body">
            <span class="ni__label">
              {{ node().label }}
              @if (node().badge) {
                <span class="ni__badge">{{ node().badge }}</span>
              }
            </span>
            @if (node().description) {
              <span class="ni__desc">{{ node().description }}</span>
            }
          </span>
          <span class="ni__chev">▸</span>
        </button>

        @if (open()) {
          <div #flyout class="ni__flyout" [class.ni__flyout--left]="flipLeft()">
            @if (node().path) {
              <a
                class="ni__open"
                [routerLink]="node().path"
                (click)="navigate.emit()"
              >
                <span>Open {{ node().label }}</span>
                <span class="ni__open-arrow">↵</span>
              </a>
            }
            @for (child of node().children; track child.label) {
              <app-nav-item [node]="child" (navigate)="navigate.emit()" />
            }
          </div>
        }
      } @else {
        <a
          class="ni__row"
          [routerLink]="node().path"
          routerLinkActive="ni__row--active"
          (click)="navigate.emit()"
        >
          @if (node().icon) {
            <span class="ni__icon">{{ node().icon }}</span>
          }
          <span class="ni__body">
            <span class="ni__label">
              {{ node().label }}
              @if (node().badge) {
                <span class="ni__badge">{{ node().badge }}</span>
              }
            </span>
            @if (node().description) {
              <span class="ni__desc">{{ node().description }}</span>
            }
          </span>
        </a>
      }
    </div>
  `,
  styleUrl: './nav-item.component.css',
})
export class NavItemComponent {
  readonly node = input.required<NavNode>();
  readonly navigate = output<void>();

  readonly open = signal(false);
  readonly flipLeft = signal(false);
  private readonly flyout = viewChild<ElementRef<HTMLElement>>('flyout');
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  hasChildren(): boolean {
    return !!this.node().children?.length;
  }

  onEnter(): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    if (this.hasChildren()) {
      this.open.set(true);
      queueMicrotask(() => this.measure());
    }
  }

  onLeave(): void {
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
    this.leaveTimer = setTimeout(() => {
      this.open.set(false);
      this.leaveTimer = null;
    }, 120);
  }

  toggle(): void {
    this.open.update((v) => !v);
    if (this.open()) queueMicrotask(() => this.measure());
  }

  private measure(): void {
    const el = this.flyout()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.flipLeft.set(rect.right > window.innerWidth - 8);
  }
}
