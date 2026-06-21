export type IncomeType =
  | 'salary'
  | 'freelance'
  | 'bonus'
  | 'commission'
  | 'gift'
  | 'dividend'
  | 'business'
  | 'one_time'
  | 'custom';

export type RecurrenceType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'one_time'
  | 'custom';

export type IncomeStatus = 'received' | 'pending' | 'scheduled' | 'cancelled';

export type PaymentMode =
  | 'bank_transfer'
  | 'cash'
  | 'card'
  | 'upi'
  | 'paypal'
  | 'crypto'
  | 'cheque'
  | 'other';

export interface CustomField {
  key: string;
  value: unknown;
  label?: string;
}

export interface AttachmentMeta {
  file_name: string;
  url?: string;
  content_type?: string;
  size?: number;
}

export interface Income {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  income_type: IncomeType;
  recurrence: RecurrenceType;
  status: IncomeStatus;
  payment_date: string;
  payment_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  day_of_month?: number | null;
  auto_add?: boolean;
  is_auto_generated?: boolean;
  recurring_parent_id?: string | null;
  next_run_at?: string | null;
  category_id?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  tag_ids: string[];
  payment_mode?: PaymentMode | null;
  platform?: string | null;
  client?: string | null;
  employer?: string | null;
  project_name?: string | null;
  reference_number?: string | null;
  notes?: string | null;
  tax_notes?: string | null;
  is_taxable: boolean;
  attachments: AttachmentMeta[];
  custom_fields: CustomField[];
  metadata: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
}

export type IncomePayload = Partial<Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & {
  title: string;
  amount: number;
  payment_date: string;
};

/** Scope of a recurring-salary update (mirrors backend UpdateScope). */
export type UpdateScope = 'all' | 'this_month' | 'this_and_future' | 'future_only';

/** Payload for a scoped update of a recurring income series. */
export interface ScopedUpdatePayload {
  scope: UpdateScope;
  changes: Partial<IncomePayload>;
}


export interface IncomeFilters {
  search?: string | null;
  income_type?: IncomeType | null;
  recurrence?: RecurrenceType | null;
  status?: IncomeStatus | null;
  payment_mode?: PaymentMode | null;
  category_id?: string | null;
  source_id?: string | null;
  tag_id?: string | null;
  currency?: string | null;
  min_amount?: number | null;
  max_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_recurring?: boolean | null;
}
