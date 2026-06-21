import { Injectable } from '@angular/core';
import { IncomeType, RecurrenceType } from '../../../../core/models/income.model';
import { FieldContext } from '../models/form-field.model';
import { TYPE_FIELD_MAP, AUTO_RECURRING_TYPES } from '../config/type-field-map.config';
import {
  RECURRENCE_FIELDS,
  MONTHLY_RECURRENCE_FIELDS,
  isRecurring,
  isMonthAligned,
} from '../config/recurrence-rules.config';

/**
 * Computes which fields are visible for a given income type + recurrence
 * combination. Pure and dependency-free so it can be unit-tested and reused
 * by both the add and edit experiences.
 */
@Injectable({ providedIn: 'root' })
export class FieldVisibilityService {
  /** The full ordered set of visible field keys for a context. */
  visibleFields(ctx: FieldContext): string[] {
    const base = TYPE_FIELD_MAP[ctx.incomeType] ?? TYPE_FIELD_MAP.custom;
    const keys = new Set(base);

    if (this.supportsRecurrence(ctx.incomeType) && isRecurring(ctx.recurrence)) {
      RECURRENCE_FIELDS.forEach((k) => keys.add(k));
      if (isMonthAligned(ctx.recurrence)) {
        MONTHLY_RECURRENCE_FIELDS.forEach((k) => keys.add(k));
      }
    }

    // Preserve a stable, registry-driven order rather than Set insertion order.
    return base.length ? this.ordered([...keys]) : [...keys];
  }

  /** Whether a single field key is visible in the given context. */
  isVisible(key: string, ctx: FieldContext): boolean {
    return this.visibleFields(ctx).includes(key);
  }

  /** Whether this income type can be turned into an auto-recurring entry. */
  supportsRecurrence(type: IncomeType): boolean {
    const map = TYPE_FIELD_MAP[type] ?? [];
    return map.includes('recurrence');
  }

  /** Whether this type can be automated (system records it each cycle). */
  supportsAutomation(type: IncomeType): boolean {
    return AUTO_RECURRING_TYPES.includes(type);
  }

  /** Whether auto-add should be offered for this type + recurrence. */
  canAutomate(ctx: FieldContext): boolean {
    return this.supportsAutomation(ctx.incomeType) && isRecurring(ctx.recurrence);
  }

  private ordered(keys: string[]): string[] {
    const order = [
      'title',
      'amount',
      'currency',
      'income_type',
      'recurrence',
      'status',
      'payment_date',
      'payment_time',
      'start_date',
      'end_date',
      'day_of_month',
      'auto_add',
      'employer',
      'client',
      'platform',
      'project_name',
      'reference_number',
      'payment_mode',
      'category_id',
      'source_id',
      'is_taxable',
      'tag_ids',
      'notes',
    ];
    return order.filter((k) => keys.includes(k));
  }
}
