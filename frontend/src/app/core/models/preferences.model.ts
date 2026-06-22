export interface Preferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  default_currency: string;
  default_group_by: string;
  default_chart_style: string;
  week_starts_on: string;
  number_format: string;
  dashboard_widgets: Record<string, boolean>;
  notifications: NotificationPreferences;
  metadata: Record<string, unknown>;
}

/** User-facing notification settings. `channels` toggles individual emails. */
export interface NotificationPreferences {
  email: boolean;
  weekly_summary?: boolean;
  channels: Record<string, boolean>;
  [key: string]: unknown;
}

/** A single toggleable email type, surfaced by GET /email/channels. */
export interface EmailChannel {
  key: string;
  label: string;
  description: string;
  group: string;
  locked: boolean;
}

export interface EmailStatus {
  enabled: boolean;
  provider: string;
  ready: boolean;
  sender: string;
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
