import { ReportSectionId } from '../models/report-options.model';

/**
 * ─────────────────────────────────────────────────────────────
 *  Section catalogue — metadata for the dialog's section toggles
 * ─────────────────────────────────────────────────────────────
 */
export interface ReportSectionMeta {
  id: ReportSectionId;
  label: string;
  description: string;
  icon: string;
  /** Cover is structural — cannot be switched off. */
  locked?: boolean;
}

export const REPORT_SECTIONS: ReportSectionMeta[] = [
  {
    id: 'cover',
    label: 'Cinematic cover',
    description: 'Title page with gradient backdrop and seal.',
    icon: '◈',
    locked: true,
  },
  {
    id: 'summary',
    label: 'Executive summary',
    description: 'Headline KPIs — total, entries, average, peak.',
    icon: '▣',
  },
  {
    id: 'categories',
    label: 'Category breakdown',
    description: 'Distribution of income across categories.',
    icon: '◑',
  },
  {
    id: 'types',
    label: 'Type composition',
    description: 'Split by income type with share bars.',
    icon: '◐',
  },
  {
    id: 'trend',
    label: 'Momentum trend',
    description: 'Vector column chart of income over time.',
    icon: '▦',
  },
  {
    id: 'ledger',
    label: 'Detailed ledger',
    description: 'Full itemised table of every entry.',
    icon: '☰',
  },
];
