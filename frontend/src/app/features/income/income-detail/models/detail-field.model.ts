/** A single label / value pair rendered inside a detail section. */
export interface DetailField {
  label: string;
  value: string;
  /** Optional leading glyph for the row. */
  icon?: string;
  /** Controls how the value is styled. */
  kind?: 'text' | 'mono' | 'muted' | 'strong';
}

/** A titled group of related fields. */
export interface DetailSection {
  id: string;
  title: string;
  icon: string;
  fields: DetailField[];
}
