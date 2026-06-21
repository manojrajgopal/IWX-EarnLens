import { Income } from '../../../../core/models/income.model';
import { DetailSection } from '../models/detail-field.model';
import { DetailLookups } from '../models/detail-lookups.model';
import { recurrenceLabel } from '../config/recurrence.config';
import {
  formatBool,
  formatDate,
  formatDateTime,
  formatDayOfMonth,
  formatText,
  humanizeToken,
} from './detail-format.util';
import { isOneTime } from './income-classify.util';

function categoryName(income: Income, lookups: DetailLookups): string {
  const id = income.category_id;
  return (id && lookups.categories.get(id)?.name) || '—';
}

function sourceName(income: Income, lookups: DetailLookups): string {
  if (income.source_name) return income.source_name;
  const id = income.source_id;
  return (id && lookups.sources.get(id)?.name) || '—';
}

function tagNames(income: Income, lookups: DetailLookups): string {
  if (!income.tag_ids?.length) return '—';
  const names = income.tag_ids.map((id) => lookups.tags.get(id)?.name ?? id);
  return names.join(', ');
}

/**
 * Build every detail section for an income. Empty optional rows collapse to
 * keep the layout tight, and sections with nothing to show are dropped.
 */
export function buildDetailSections(
  income: Income,
  lookups: DetailLookups,
): DetailSection[] {
  const sections: DetailSection[] = [
    {
      id: 'schedule',
      title: 'Timing & schedule',
      icon: '🗓',
      fields: [
        { label: 'Payment date', value: formatDate(income.payment_date) },
        { label: 'Payment time', value: formatText(income.payment_time) },
        {
          label: 'Recurrence',
          value: isOneTime(income) ? 'One-time' : recurrenceLabel(income.recurrence),
        },
        { label: 'Day of month', value: formatDayOfMonth(income.day_of_month) },
        { label: 'Starts', value: formatDate(income.start_date) },
        { label: 'Ends', value: formatDate(income.end_date) },
        { label: 'Auto-add', value: formatBool(income.auto_add) },
        { label: 'Next run', value: formatDateTime(income.next_run_at) },
      ],
    },
    {
      id: 'classification',
      title: 'Classification',
      icon: '🏷',
      fields: [
        { label: 'Type', value: humanizeToken(income.income_type) },
        { label: 'Status', value: humanizeToken(income.status) },
        { label: 'Currency', value: income.currency },
        { label: 'Taxable', value: formatBool(income.is_taxable) },
        { label: 'Category', value: categoryName(income, lookups) },
        { label: 'Source', value: sourceName(income, lookups) },
        { label: 'Tags', value: tagNames(income, lookups) },
      ],
    },
    {
      id: 'parties',
      title: 'Parties & payment',
      icon: '🤝',
      fields: [
        { label: 'Payment mode', value: humanizeToken(income.payment_mode) },
        { label: 'Client', value: formatText(income.client) },
        { label: 'Employer', value: formatText(income.employer) },
        { label: 'Platform', value: formatText(income.platform) },
        { label: 'Project', value: formatText(income.project_name) },
        {
          label: 'Reference',
          value: formatText(income.reference_number),
          kind: 'mono',
        },
      ],
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: '📝',
      fields: [
        { label: 'Notes', value: formatText(income.notes) },
        { label: 'Tax notes', value: formatText(income.tax_notes) },
      ],
    },
    {
      id: 'system',
      title: 'Record',
      icon: '🧾',
      fields: [
        { label: 'Created', value: formatDateTime(income.created_at), kind: 'muted' },
        { label: 'Updated', value: formatDateTime(income.updated_at), kind: 'muted' },
        { label: 'Auto-generated', value: formatBool(income.is_auto_generated) },
      ],
    },
  ];

  return sections
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) => field.value !== '—'),
    }))
    .filter((section) => section.fields.length > 0);
}
