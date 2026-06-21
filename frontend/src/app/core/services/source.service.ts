import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Source, SourcePayload } from '../models/source.model';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly api = inject(ApiService);

  list(): Observable<Source[]> {
    return this.api.get<Source[]>('/sources');
  }

  create(payload: SourcePayload): Observable<Source> {
    return this.api.post<Source>('/sources', payload);
  }

  update(id: string, payload: Partial<SourcePayload>): Observable<Source> {
    return this.api.patch<Source>(`/sources/${id}`, payload);
  }

  remove(id: string): Observable<{ deleted: boolean }> {
    return this.api.delete<{ deleted: boolean }>(`/sources/${id}`);
  }
}
