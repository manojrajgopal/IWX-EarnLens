import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { PasswordChange, ProfileUpdate, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  me(): Observable<User> {
    return this.api.get<User>('/users/me').pipe(tap((user) => this.auth.setUser(user)));
  }

  update(payload: ProfileUpdate): Observable<User> {
    return this.api.patch<User>('/users/me', payload).pipe(tap((user) => this.auth.setUser(user)));
  }

  changePassword(payload: PasswordChange): Observable<{ changed: boolean }> {
    return this.api.post<{ changed: boolean }>('/users/me/change-password', payload);
  }
}
