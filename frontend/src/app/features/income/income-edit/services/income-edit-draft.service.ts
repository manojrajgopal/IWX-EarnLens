import { Injectable } from '@angular/core';

const STORAGE_KEY = 'ewl_income_edit_draft';

export interface EditDraft {
  incomeId: string;
  formValue: Record<string, unknown>;
  selectedTags: string[];
  unlocked: boolean;
}

@Injectable({ providedIn: 'root' })
export class IncomeEditDraftService {
  save(draft: EditDraft): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  load(): EditDraft | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as EditDraft;
    } catch {
      return null;
    }
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
