import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconEntry, ICON_GROUPS, ICON_MAP } from './icon-registry';

/**
 * Professional icon picker — grouped, searchable, selectable.
 * Opens as a dropdown panel when the trigger is clicked.
 *
 * Usage:
 *   <app-icon-picker [value]="form.value.icon" (pick)="form.patchValue({ icon: $event })" />
 */
@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="ip" [class.ip--open]="open()">
      <!-- Trigger button -->
      <button type="button" class="ip__trigger" (click)="toggle()">
        @if (selectedIcon()) {
          <svg class="ip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path [attr.d]="selectedIcon()!.path" />
          </svg>
          <span class="ip__name">{{ selectedIcon()!.name }}</span>
        } @else {
          <svg class="ip__svg ip__svg--muted" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span class="ip__placeholder">Choose icon</span>
        }
        <svg class="ip__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <!-- Dropdown panel -->
      @if (open()) {
        <div class="ip__panel">
          <!-- Search -->
          <div class="ip__search-wrap">
            <svg class="ip__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input #searchInput class="ip__search" type="text" placeholder="Search icons…"
                   [ngModel]="query()" (ngModelChange)="query.set($event)" />
            @if (query()) {
              <button type="button" class="ip__search-clear" (click)="query.set('')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            }
          </div>

          <!-- Category tabs (hidden during search) -->
          @if (!query()) {
            <div class="ip__tabs">
              @for (g of groups; track g.id) {
                <button type="button" class="ip__tab"
                        [class.ip__tab--active]="activeGroup() === g.id"
                        (click)="activeGroup.set(g.id)"
                        [title]="g.label">
                  {{ g.tab }}
                </button>
              }
            </div>
          }

          <!-- Icon grid -->
          <div class="ip__grid-wrap">
            @if (filteredIcons().length) {
              <div class="ip__grid">
                @for (icon of filteredIcons(); track icon.id) {
                  <button type="button" class="ip__icon"
                          [class.ip__icon--active]="value() === icon.id"
                          [title]="icon.name"
                          (click)="select(icon)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path [attr.d]="icon.path" />
                    </svg>
                  </button>
                }
              </div>
            } @else {
              <p class="ip__empty">No icons match "{{ query() }}"</p>
            }
          </div>

          <!-- Clear button -->
          @if (value()) {
            <button type="button" class="ip__clear" (click)="select(null)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Remove icon
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .ip { position: relative; }

    .ip__trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--r-sm, 0.5rem);
      background: var(--bg-surface, #fff);
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-size: 0.875rem;
    }
    .ip__trigger:hover { border-color: var(--border-focus, #6366f1); }
    .ip--open .ip__trigger {
      border-color: var(--border-focus, #6366f1);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--border-focus, #6366f1) 15%, transparent);
    }

    .ip__svg { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
    .ip__svg--muted { opacity: 0.4; }
    .ip__name { flex: 1; text-align: left; font-weight: 500; }
    .ip__placeholder { flex: 1; text-align: left; color: var(--text-tertiary, #9ca3af); }
    .ip__chevron {
      width: 1rem; height: 1rem; opacity: 0.4;
      transition: transform 0.2s;
    }
    .ip--open .ip__chevron { transform: rotate(180deg); }

    /* ─── Panel ─── */
    .ip__panel {
      position: absolute;
      z-index: 50;
      top: calc(100% + 0.4rem);
      left: 0;
      width: min(26rem, 92vw);
      background: var(--bg-surface, #fff);
      border: 1px solid var(--border-color);
      border-radius: var(--r-sm, 0.5rem);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: ip-slide 0.15s ease-out;
    }
    @keyframes ip-slide {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── Search ─── */
    .ip__search-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .ip__search-icon { width: 1rem; height: 1rem; opacity: 0.45; flex-shrink: 0; }
    .ip__search {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.85rem;
      background: transparent;
      color: var(--text-primary);
    }
    .ip__search::placeholder { color: var(--text-tertiary, #9ca3af); }
    .ip__search-clear {
      width: 1.2rem; height: 1.2rem; padding: 0; border: none;
      background: none; cursor: pointer; opacity: 0.5;
    }
    .ip__search-clear:hover { opacity: 1; }
    .ip__search-clear svg { width: 100%; height: 100%; }

    /* ─── Category Tabs ─── */
    .ip__tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      padding: 0.5rem 0.6rem;
      border-bottom: 1px solid var(--border-color);
    }
    .ip__tab {
      padding: 0.3rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 500;
      border: 1px solid var(--border-color);
      border-radius: 999px;
      background: var(--bg-surface, #fff);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s;
    }
    .ip__tab:hover {
      color: var(--text-primary);
      border-color: var(--text-secondary);
    }
    .ip__tab--active {
      color: #fff;
      background: var(--border-focus, #6366f1);
      border-color: transparent;
    }
    .ip__tab--active:hover {
      color: #fff;
      border-color: transparent;
    }

    /* ─── Grid ─── */
    .ip__grid-wrap {
      max-height: 16rem;
      overflow-y: auto;
      padding: 0.6rem;
    }
    .ip__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(2.4rem, 1fr));
      gap: 0.35rem;
    }
    .ip__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.4rem;
      height: 2.4rem;
      border-radius: var(--r-sm, 0.375rem);
      border: 1px solid transparent;
      background: none;
      cursor: pointer;
      color: var(--text-primary);
      transition: background 0.12s, border-color 0.12s, transform 0.1s;
    }
    .ip__icon svg { width: 1.25rem; height: 1.25rem; }
    .ip__icon:hover {
      background: var(--bg-hover, #f3f4f6);
      border-color: var(--border-color);
      transform: scale(1.1);
    }
    .ip__icon--active {
      background: color-mix(in srgb, var(--border-focus, #6366f1) 14%, transparent);
      border-color: var(--border-focus, #6366f1);
      color: var(--border-focus, #6366f1);
    }

    .ip__empty {
      text-align: center;
      padding: 2rem 1rem;
      font-size: 0.8rem;
      color: var(--text-tertiary, #9ca3af);
    }

    /* ─── Clear ─── */
    .ip__clear {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem;
      border: none;
      border-top: 1px solid var(--border-color);
      background: none;
      cursor: pointer;
      font-size: 0.78rem;
      color: var(--text-secondary);
      transition: color 0.15s, background 0.15s;
    }
    .ip__clear svg { width: 0.85rem; height: 0.85rem; }
    .ip__clear:hover { background: var(--bg-hover, #f3f4f6); color: var(--negative, #dc2626); }
  `],
})
export class IconPickerComponent {
  /** Currently selected icon id (two-way via value + pick). */
  readonly value = input<string | null>(null);
  readonly pick = output<string | null>();

  protected readonly groups = ICON_GROUPS;
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeGroup = signal(ICON_GROUPS[0].id);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Resolved entry for the currently selected value. */
  protected readonly selectedIcon = computed<IconEntry | null>(() => {
    const v = this.value();
    return v ? ICON_MAP.get(v) ?? null : null;
  });

  /** Filtered icons: if query is set, search all groups; else show active group. */
  protected readonly filteredIcons = computed<IconEntry[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (q) {
      return ICON_GROUPS.flatMap((g) => g.icons).filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.includes(q) ||
          i.keywords.some((k) => k.includes(q))
      );
    }
    const group = ICON_GROUPS.find((g) => g.id === this.activeGroup());
    return group ? group.icons : [];
  });

  toggle(): void {
    this.open.update((v) => !v);
    if (this.open()) {
      this.query.set('');
      setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
    }
  }

  select(icon: IconEntry | null): void {
    this.pick.emit(icon?.id ?? null);
    this.open.set(false);
  }

  /** Close on outside click. */
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.open() && !(e.target as HTMLElement).closest('.ip')) {
      this.open.set(false);
    }
  }

  /** Close on Escape. */
  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open()) this.open.set(false);
  }
}
