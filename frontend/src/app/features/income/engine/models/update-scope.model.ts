/**
 * Scope of a recurring-salary update. Choosing the wrong scope can rewrite
 * historical records, so the edit experience forces an explicit choice.
 */
export type UpdateScope =
  /** Apply to every occurrence — past, present and future. Destructive. */
  | 'all'
  /** Apply only to the current month's occurrence. */
  | 'this_month'
  /** Apply to this month and every future occurrence; leave the past intact. */
  | 'this_and_future'
  /** Apply only to occurrences strictly in the future. */
  | 'future_only';

export interface UpdateScopeOption {
  value: UpdateScope;
  label: string;
  description: string;
  /** Risk level — drives the warning colour in the UI. */
  severity: 'safe' | 'caution' | 'danger';
  icon: string;
}

/** Ordered, user-facing list of salary update scopes. */
export const UPDATE_SCOPE_OPTIONS: UpdateScopeOption[] = [
  {
    value: 'this_month',
    label: 'Only this month',
    description: 'Change just the current month’s entry. Past and future months stay exactly as they are.',
    severity: 'safe',
    icon: '◔',
  },
  {
    value: 'this_and_future',
    label: 'This month and the future',
    description: 'Change the current month and every month after it. Already-recorded past months are never touched.',
    severity: 'caution',
    icon: '⇥',
  },
  {
    value: 'future_only',
    label: 'Future months only',
    description: 'Leave this month as-is and only change months that have not happened yet.',
    severity: 'caution',
    icon: '↦',
  },
  {
    value: 'all',
    label: 'Complete salary (all months)',
    description: 'Rewrite every occurrence including historical, already-recorded income. This permanently alters your past records.',
    severity: 'danger',
    icon: '⚠',
  },
];
