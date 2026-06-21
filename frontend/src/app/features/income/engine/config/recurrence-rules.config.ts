import { RecurrenceType } from '../../../../core/models/income.model';

/** Recurrence values that mean "this income repeats". */
export const RECURRING_VALUES: RecurrenceType[] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom',
];

/** Field keys that only make sense when an income recurs. */
export const RECURRENCE_FIELDS: string[] = ['start_date', 'end_date', 'auto_add'];

/** Field keys that only make sense for month-aligned recurrence. */
export const MONTHLY_RECURRENCE_FIELDS: string[] = ['day_of_month'];

/** Recurrence values that expose the "day of month" pay-day picker. */
export const MONTH_ALIGNED_VALUES: RecurrenceType[] = ['monthly', 'quarterly', 'yearly'];

/** True when the given recurrence represents a repeating schedule. */
export function isRecurring(recurrence: RecurrenceType): boolean {
  return RECURRING_VALUES.includes(recurrence);
}

/** True when the recurrence is aligned to a day of the month. */
export function isMonthAligned(recurrence: RecurrenceType): boolean {
  return MONTH_ALIGNED_VALUES.includes(recurrence);
}

/** Human-readable cadence label for previews. */
export const RECURRENCE_CADENCE: Record<RecurrenceType, string> = {
  daily: 'every day',
  weekly: 'every week',
  monthly: 'every month',
  quarterly: 'every 3 months',
  yearly: 'every year',
  one_time: 'once',
  custom: 'on a custom schedule',
};
