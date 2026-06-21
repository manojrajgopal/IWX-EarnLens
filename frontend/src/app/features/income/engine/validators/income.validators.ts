import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Income-specific reactive validators. Kept framework-pure so they can be
 * attached to either the add or the strict edit form.
 */

/** Amount must be a positive, finite number. */
export function positiveAmount(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value);
    if (control.value === null || control.value === '' || Number.isNaN(value)) {
      return { required: true };
    }
    if (!Number.isFinite(value) || value <= 0) {
      return { positiveAmount: true };
    }
    if (value > 1_000_000_000) {
      return { amountTooLarge: true };
    }
    return null;
  };
}

/** end_date (when present) must be on or after start_date. */
export function dateRange(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    if (!start || !end) {
      return null;
    }
    return new Date(end) < new Date(start) ? { dateRange: true } : null;
  };
}

/** A recurring entry that auto-adds must define a start date. */
export function recurringRequiresStart(
  recurrenceKey: string,
  autoKey: string,
  startKey: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const recurrence = group.get(recurrenceKey)?.value;
    const auto = group.get(autoKey)?.value;
    const start = group.get(startKey)?.value;
    const repeats = recurrence && recurrence !== 'one_time';
    if (repeats && auto && !start) {
      return { startRequired: true };
    }
    return null;
  };
}

/** Day-of-month must be between 1 and 28 to be valid in every month. */
export function safeDayOfMonth(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '' || control.value === undefined) {
      return null;
    }
    const day = Number(control.value);
    if (Number.isNaN(day) || day < 1 || day > 28) {
      return { dayOfMonth: true };
    }
    return null;
  };
}

/** A payment date must not be set unreasonably far in the future. */
export function notFarFuture(maxYearsAhead = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const date = new Date(control.value);
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() + maxYearsAhead);
    return date > limit ? { farFuture: true } : null;
  };
}
