import { Injectable } from '@angular/core';

const STORAGE_KEY = 'ewl_income_form_draft';

export interface IncomeDraft {
  formValue: Record<string, unknown>;
  selectedTags: string[];
}

/**
 * Persists the Add Income form state to sessionStorage so the user can
 * navigate away (e.g. to create a category or source) and return without
 * losing their data.
 */
@Injectable({ providedIn: 'root' })
export class IncomeFormDraftService {
  save(draft: IncomeDraft): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  load(): IncomeDraft | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IncomeDraft;
    } catch {
      return null;
    }
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  has(): boolean {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  }
}
