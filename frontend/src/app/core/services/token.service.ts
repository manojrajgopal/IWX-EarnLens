import { Injectable } from '@angular/core';
import { TokenPair } from '../models/user.model';

const ACCESS_KEY = 'earnlens.access';
const REFRESH_KEY = 'earnlens.refresh';

/** Centralized, swappable token storage. */
@Injectable({ providedIn: 'root' })
export class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  setTokens(tokens: TokenPair): void {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  hasSession(): boolean {
    return !!this.getAccessToken();
  }
}
