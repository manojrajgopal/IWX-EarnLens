import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EmailChannel, EmailStatus } from '../models/preferences.model';

/** Talks to the backend email module (status, channel catalog, test send). */
@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly api = inject(ApiService);

  /** Current provider/readiness info. */
  status(): Observable<EmailStatus> {
    return this.api.get<EmailStatus>('/email/status');
  }

  /** The catalog of toggleable email types (used to render settings). */
  channels(): Observable<EmailChannel[]> {
    return this.api.get<EmailChannel[]>('/email/channels');
  }

  /** Fires a welcome email to the current user for verification. */
  sendTest(): Observable<{ sent: boolean }> {
    return this.api.post<{ sent: boolean }>('/email/test', {});
  }
}
