import { FormFieldDef } from '../models/form-field.model';

/**
 * The single source of truth for every income form field. Sections and the
 * per-type visibility map reference these by key, so a field is defined once
 * and reused everywhere.
 */
export const FIELD_REGISTRY: Record<string, FormFieldDef> = {
  title: {
    key: 'title',
    label: 'Title',
    kind: 'text',
    placeholder: 'e.g. October salary',
    required: true,
  },
  amount: {
    key: 'amount',
    label: 'Amount',
    kind: 'number',
    required: true,
    min: 0.01,
    step: 0.01,
  },
  currency: {
    key: 'currency',
    label: 'Currency',
    kind: 'currency',
    optionsKey: 'currency',
    required: true,
  },
  income_type: {
    key: 'income_type',
    label: 'Type',
    kind: 'select',
    optionsKey: 'incomeType',
    required: true,
    hint: 'Changing the type updates which fields you need to fill in.',
  },
  recurrence: {
    key: 'recurrence',
    label: 'Recurrence',
    kind: 'select',
    optionsKey: 'recurrence',
    required: true,
    hint: 'How often this income repeats.',
  },
  status: {
    key: 'status',
    label: 'Status',
    kind: 'select',
    optionsKey: 'status',
    required: true,
  },
  payment_date: {
    key: 'payment_date',
    label: 'Payment date',
    kind: 'date',
    required: true,
  },
  payment_time: {
    key: 'payment_time',
    label: 'Payment time',
    kind: 'time',
    hint: 'Exact time the money was received.',
  },
  start_date: {
    key: 'start_date',
    label: 'Starts on',
    kind: 'date',
    required: true,
    hint: 'First occurrence of this recurring income.',
  },
  end_date: {
    key: 'end_date',
    label: 'Ends on',
    kind: 'date',
    hint: 'Leave empty to repeat indefinitely.',
  },
  day_of_month: {
    key: 'day_of_month',
    label: 'Pay day (day of month)',
    kind: 'select',
    optionsKey: 'dayOfMonth',
    hint: 'Which day each month the amount is added automatically.',
  },
  auto_add: {
    key: 'auto_add',
    label: 'Automatically add every cycle',
    kind: 'checkbox',
    defaultValue: false,
    hint: 'When on, the system records this income for you on each cycle — no manual entry.',
  },
  category_id: {
    key: 'category_id',
    label: 'Category',
    kind: 'select',
    optionsKey: 'category',
  },
  source_id: {
    key: 'source_id',
    label: 'Source',
    kind: 'select',
    optionsKey: 'source',
  },
  payment_mode: {
    key: 'payment_mode',
    label: 'Payment mode',
    kind: 'select',
    optionsKey: 'paymentMode',
  },
  employer: {
    key: 'employer',
    label: 'Employer',
    kind: 'text',
    placeholder: 'Company name',
  },
  client: {
    key: 'client',
    label: 'Client',
    kind: 'text',
    placeholder: 'Who paid you',
  },
  platform: {
    key: 'platform',
    label: 'Platform',
    kind: 'text',
    placeholder: 'e.g. Upwork, Zerodha',
  },
  project_name: {
    key: 'project_name',
    label: 'Project',
    kind: 'text',
    placeholder: 'Project or engagement name',
  },
  reference_number: {
    key: 'reference_number',
    label: 'Reference number',
    kind: 'text',
    placeholder: 'Invoice / transaction ref',
  },
  is_taxable: {
    key: 'is_taxable',
    label: 'Taxable income',
    kind: 'checkbox',
    defaultValue: true,
  },
  tag_ids: {
    key: 'tag_ids',
    label: 'Tags',
    kind: 'tags',
  },
  notes: {
    key: 'notes',
    label: 'Notes',
    kind: 'textarea',
    placeholder: 'Anything to remember…',
  },
};
