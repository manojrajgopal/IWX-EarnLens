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
  start_date?: string | null;
  end_date?: string | null;
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
