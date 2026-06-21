import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Preferences, PreferencesUpdate } from '../models/preferences.model';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly api = inject(ApiService);

  get(): Observable<Preferences> {
    return this.api.get<Preferences>('/preferences');
  }

  update(payload: PreferencesUpdate): Observable<Preferences> {
    return this.api.patch<Preferences>('/preferences', payload);
  }
}
