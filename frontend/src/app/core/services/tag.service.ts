import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tag, TagPayload } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly api = inject(ApiService);

  list(): Observable<Tag[]> {
    return this.api.get<Tag[]>('/tags');
  }

  create(payload: TagPayload): Observable<Tag> {
    return this.api.post<Tag>('/tags', payload);
  }

  update(id: string, payload: Partial<TagPayload>): Observable<Tag> {
    return this.api.patch<Tag>(`/tags/${id}`, payload);
  }

  remove(id: string): Observable<{ deleted: boolean }> {
    return this.api.delete<{ deleted: boolean }>(`/tags/${id}`);
  }
}
