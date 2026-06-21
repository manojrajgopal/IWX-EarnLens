export interface Preferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  default_currency: string;
  default_group_by: string;
  default_chart_style: string;
  week_starts_on: string;
  number_format: string;
  dashboard_widgets: Record<string, boolean>;
  notifications: Record<string, boolean>;
  metadata: Record<string, unknown>;
}

export type PreferencesUpdate = Partial<Omit<Preferences, 'user_id'>>;

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id?: string | null;
  summary?: string | null;
  metadata: Record<string, unknown>;
  created_at?: string | null;
}
