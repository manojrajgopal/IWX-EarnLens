import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api.model';
import { ActivityLog } from '../models/preferences.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly api = inject(ApiService);

  list(page = 1, pageSize = 20): Observable<PaginatedResponse<ActivityLog>> {
    return this.api.getPaginated<ActivityLog>(
      '/activity',
      this.api.toParams({ page, page_size: pageSize }),
    );
  }
}
