import { Component, computed, input, output } from '@angular/core';

/**
 * Reusable, dependency-free pagination control.
 *
 * Renders a compact window of numbered pages with ellipses plus
 * previous / next steppers. Purely presentational — it owns no state
 * and simply emits the page the user wants to move to.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  /** Active page (1-based). */
  readonly page = input.required<number>();
  /** Total number of pages available. */
  readonly totalPages = input.required<number>();
  /** Optional total item count, shown as a caption. */
  readonly total = input<number | null>(null);
  /** How many numbered buttons to keep visible around the current page. */
  readonly window = input<number>(1);

  readonly pageChange = output<number>();

  readonly canPrev = computed(() => this.page() > 1);
  readonly canNext = computed(() => this.page() < this.totalPages());

  /** Sequence of page numbers / gap markers to render. */
  readonly slots = computed<(number | 'gap')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const win = this.window();
    if (total <= 1) return [1];

    const pages = new Set<number>([1, total]);
    for (let i = current - win; i <= current + win; i++) {
      if (i >= 1 && i <= total) pages.add(i);
    }

    const ordered = [...pages].sort((a, b) => a - b);
    const slots: (number | 'gap')[] = [];
    let prev = 0;
    for (const p of ordered) {
      if (prev && p - prev > 1) slots.push('gap');
      slots.push(p);
      prev = p;
    }
    return slots;
  });

  go(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) return;
    this.pageChange.emit(page);
  }
}
