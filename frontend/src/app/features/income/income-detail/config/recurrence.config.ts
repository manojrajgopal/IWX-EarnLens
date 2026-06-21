import { RecurrenceType } from '../../../../core/models/income.model';

/** Human label for each recurrence cadence. */
export const RECURRENCE_LABEL: Record<RecurrenceType, string> = {
  one_time: 'One-time',
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
  quarterly: 'Every quarter',
  yearly: 'Every year',
  custom: 'Custom schedule',
};

export function recurrenceLabel(recurrence: RecurrenceType): string {
  return RECURRENCE_LABEL[recurrence] ?? 'One-time';
}
