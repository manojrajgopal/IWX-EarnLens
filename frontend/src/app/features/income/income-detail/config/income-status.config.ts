import { IncomeStatus } from '../../../../core/models/income.model';

/** Visual treatment for an income status chip. */
export interface StatusTheme {
  label: string;
  /** Semantic CSS colour token (without the var() wrapper). */
  tone: string;
  icon: string;
}

export const STATUS_THEME: Record<IncomeStatus, StatusTheme> = {
  received: { label: 'Received', tone: '--positive', icon: '✓' },
  pending: { label: 'Pending', tone: '--warning', icon: '◷' },
  scheduled: { label: 'Scheduled', tone: '--info', icon: '◴' },
  cancelled: { label: 'Cancelled', tone: '--negative', icon: '✕' },
};

export function statusTheme(status: IncomeStatus): StatusTheme {
  return STATUS_THEME[status] ?? STATUS_THEME.received;
}
