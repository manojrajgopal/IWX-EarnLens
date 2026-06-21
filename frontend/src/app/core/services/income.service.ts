import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api.model';
import { Income, IncomeFilters, IncomePayload } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly api = inject(ApiService);

  list(filters: IncomeFilters, page = 1, pageSize = 20): Observable<PaginatedResponse<Income>> {
    const params = this.api.toParams({ ...filters, page, page_size: pageSize });
    return this.api.getPaginated<Income>('/incomes', params);
  }

  recent(limit = 5): Observable<Income[]> {
    return this.api.get<Income[]>('/incomes/recent', this.api.toParams({ limit }));
  }

  get(id: string): Observable<Income> {
    return this.api.get<Income>(`/incomes/${id}`);
  }

  create(payload: IncomePayload): Observable<Income> {
    return this.api.post<Income>('/incomes', payload);
  }

  update(id: string, payload: Partial<IncomePayload>): Observable<Income> {
    return this.api.patch<Income>(`/incomes/${id}`, payload);
  }

  remove(id: string): Observable<{ deleted: boolean }> {
    return this.api.delete<{ deleted: boolean }>(`/incomes/${id}`);
  }
}
