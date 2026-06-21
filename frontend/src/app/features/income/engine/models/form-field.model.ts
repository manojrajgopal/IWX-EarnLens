import { IncomeType, RecurrenceType } from '../../../../core/models/income.model';

/** A field's data type — drives which control & validation applies. */
export type FieldKind =
  | 'text'
  | 'number'
  | 'currency'
  | 'select'
  | 'date'
  | 'time'
  | 'checkbox'
  | 'textarea'
  | 'tags';

/** Declarative metadata describing a single income form field. */
export interface FormFieldDef {
  /** Unique form control key. */
  key: string;
  /** Human label shown in the UI. */
  label: string;
  /** Control type. */
  kind: FieldKind;
  /** Placeholder / helper hint. */
  placeholder?: string;
  /** Short helper text rendered under the field. */
  hint?: string;
  /** Whether the field is required when visible. */
  required?: boolean;
  /** Option-source key (resolved at runtime for selects). */
  optionsKey?: OptionSource;
  /** Default value when the control is (re)created. */
  defaultValue?: unknown;
  /** Min for number fields. */
  min?: number;
  /** Step for number fields. */
  step?: number;
}

/** Named option providers resolved by the form at runtime. */
export type OptionSource =
  | 'currency'
  | 'incomeType'
  | 'recurrence'
  | 'status'
  | 'paymentMode'
  | 'category'
  | 'source'
  | 'dayOfMonth';

/** A visual grouping of fields rendered as one card. */
export interface FormSectionDef {
  id: string;
  title: string;
  description?: string;
  /** Field keys belonging to this section, in render order. */
  fieldKeys: string[];
}

/** The resolved visibility context the engine evaluates against. */
export interface FieldContext {
  incomeType: IncomeType;
  recurrence: RecurrenceType;
}
