import { Income } from '../../../../core/models/income.model';

/** True for a non-repeating, single entry. */
export function isOneTime(income: Income): boolean {
  return income.recurrence === 'one_time';
}

/** True for an auto-generated child occurrence of a series. */
export function isOccurrence(income: Income): boolean {
  return Boolean(income.recurring_parent_id) || income.is_auto_generated === true;
}

/**
 * True when this income heads a recurring series — i.e. it is the template
 * (first occurrence) that future occurrences descend from.
 */
export function isSeriesParent(income: Income): boolean {
  return !isOneTime(income) && !income.recurring_parent_id;
}

/** Whether the income participates in a series at all (parent or child). */
export function belongsToSeries(income: Income): boolean {
  return !isOneTime(income);
}

/** Id of the template document at the root of the income's series. */
export function seriesRootId(income: Income): string {
  return income.recurring_parent_id ?? income.id;
}
