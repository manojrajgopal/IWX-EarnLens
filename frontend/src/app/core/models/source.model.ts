export interface Source {
  id: string;
  user_id: string;
  name: string;
  source_type?: string | null;
  website?: string | null;
  description?: string | null;
  color: string;
  icon?: string | null;
}

export type SourcePayload = Pick<Source, 'name'> &
  Partial<Pick<Source, 'source_type' | 'website' | 'description' | 'color' | 'icon'>>;
