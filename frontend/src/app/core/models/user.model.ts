export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  is_email_verified: boolean;
  avatar_url?: string | null;
  default_currency: string;
  last_login_at?: string | null;
  created_at?: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

export interface RegisterPayload {
  full_name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string | null;
  default_currency?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}
