import { Injectable } from '@angular/core';

const STORAGE_KEY = 'ewl_register_draft';

/** Persists register form draft across navigation (sessionStorage-backed). */
@Injectable({ providedIn: 'root' })
export class RegisterDraftService {
  save(data: Record<string, string>): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* quota exceeded — ignore */ }
  }

  load(): Record<string, string> | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
