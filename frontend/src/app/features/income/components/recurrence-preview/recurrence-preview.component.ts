import { Component, computed, input } from '@angular/core';
import { RecurrenceType } from '../../../../core/models/income.model';
import {
  RECURRENCE_CADENCE,
  isMonthAligned,
  isRecurring,
} from '../../engine/config/recurrence-rules.config';

/**
 * Shows a plain-language summary of a recurring schedule plus the next few
 * projected pay dates, so the user understands what automation they are
 * setting up before they commit.
 */
@Component({
  selector: 'app-recurrence-preview',
  standalone: true,
  template: `
    @if (recurs()) {
      <div class="rp">
        <div class="rp__head">
          <span class="rp__icon">🔁</span>
          <p class="rp__summary">{{ summary() }}</p>
        </div>
        @if (autoAdd()) {
          <p class="rp__auto">
            <span class="rp__dot"></span>
            Auto-add is <strong>on</strong> — EarnLens will record this income for you
            automatically. No manual entry needed.
          </p>
        }
        @if (upcoming().length) {
          <ul class="rp__dates">
            @for (d of upcoming(); track d) {
              <li class="rp__date">{{ d }}</li>
            }
          </ul>
        }
      </div>
    }
  `,
  styles: [
    `
      .rp {
        border: 1px dashed var(--border-color);
        border-radius: var(--r-sm);
        padding: 0.9rem 1rem;
        background: var(--accent-soft);
        margin-top: 0.75rem;
      }
      .rp__head {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .rp__icon {
        font-size: 1.1rem;
      }
      .rp__summary {
        font-size: 0.9rem;
        font-weight: 600;
      }
      .rp__auto {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-secondary);
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
        line-height: 1.5;
      }
      .rp__dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 999px;
        background: var(--positive, #16a34a);
        flex-shrink: 0;
      }
      .rp__dates {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.7rem;
      }
      .rp__date {
        font-size: 0.75rem;
        padding: 0.25rem 0.55rem;
        border-radius: 999px;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
      }
    `,
  ],
})
export class RecurrencePreviewComponent {
  readonly recurrence = input<RecurrenceType>('one_time');
  readonly startDate = input<string | null>(null);
  readonly dayOfMonth = input<number | null>(null);
  readonly autoAdd = input(false);
  readonly count = input(3);

  protected readonly recurs = computed(() => isRecurring(this.recurrence()));

  protected readonly summary = computed(() => {
    const cadence = RECURRENCE_CADENCE[this.recurrence()];
    const day = this.dayOfMonth();
    if (isMonthAligned(this.recurrence()) && day) {
      return `Repeats ${cadence} on day ${day}.`;
    }
    return `Repeats ${cadence}.`;
  });

  protected readonly upcoming = computed<string[]>(() => {
    if (!this.recurs()) return [];
    const start = this.startDate() ? new Date(this.startDate() as string) : new Date();
    if (isNaN(start.getTime())) return [];

    const fmt = new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const out: string[] = [];
    const cursor = new Date(start);
    const day = this.dayOfMonth();

    for (let i = 0; i < this.count(); i++) {
      const next = new Date(cursor);
      if (day && isMonthAligned(this.recurrence())) {
        next.setDate(Math.min(day, 28));
      }
      out.push(fmt.format(next));
      this.advance(cursor);
    }
    return out;
  });

  private advance(d: Date): void {
    switch (this.recurrence()) {
      case 'daily':
        d.setDate(d.getDate() + 1);
        break;
      case 'weekly':
        d.setDate(d.getDate() + 7);
        break;
      case 'monthly':
        d.setMonth(d.getMonth() + 1);
        break;
      case 'quarterly':
        d.setMonth(d.getMonth() + 3);
        break;
      case 'yearly':
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        d.setMonth(d.getMonth() + 1);
    }
  }
}
