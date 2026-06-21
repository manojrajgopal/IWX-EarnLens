import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SEARCH_INDEX } from '../../data/nav.data';
import { SearchEntry } from '../../models/nav.model';

/**
 * Global search — a button in the header that opens a command-palette
 * overlay. Type to filter all pages; arrow keys + enter to navigate.
 * Opens with the button or the Ctrl/⌘+K shortcut.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  template: `
    <button class="search-trigger" type="button" (click)="openPalette()" aria-label="Search">
      <span class="search-trigger__icon">⌕</span>
      <span class="search-trigger__label">Search…</span>
      <span class="search-trigger__kbd">⌘K</span>
    </button>

    @if (open()) {
      <div class="palette" (click)="close()">
        <div class="palette__box" (click)="$event.stopPropagation()">
          <div class="palette__head">
            <span class="palette__icon">⌕</span>
            <input
              #box
              class="palette__input"
              type="text"
              placeholder="Search pages, actions…"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKey($event)"
            />
            <kbd class="palette__esc">ESC</kbd>
          </div>

          <div class="palette__list">
            @for (item of results(); track item.path + item.label; let i = $index) {
              <button
                class="palette__item"
                [class.palette__item--active]="i === active()"
                type="button"
                (mouseenter)="active.set(i)"
                (click)="go(item)"
              >
                <span class="palette__item-icon">{{ item.icon }}</span>
                <span class="palette__item-body">
                  <span class="palette__item-label">{{ item.label }}</span>
                  <span class="palette__item-group">{{ item.group }}</span>
                </span>
                <span class="palette__item-arrow">↵</span>
              </button>
            } @empty {
              <div class="palette__empty">No results for “{{ query() }}”</div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './search.component.css',
})
export class SearchComponent {
  readonly open = signal(false);
  readonly query = signal('');
  readonly active = signal(0);
  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');

  readonly results = computed<SearchEntry[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return SEARCH_INDEX.slice(0, 8);
    return SEARCH_INDEX.filter((e) => e.keywords.includes(q)).slice(0, 12);
  });

  constructor(private readonly router: Router) {
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.box()?.nativeElement.focus());
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onShortcut(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.openPalette();
    }
  }

  openPalette(): void {
    this.query.set('');
    this.active.set(0);
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.active.set(0);
  }

  onKey(e: KeyboardEvent): void {
    const items = this.results();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.active.update((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.active.update((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[this.active()];
      if (item) this.go(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }

  go(item: SearchEntry): void {
    this.close();
    this.router.navigateByUrl(item.path);
  }
}
