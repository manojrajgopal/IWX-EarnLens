import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  AuthResult,
  LoginPayload,
  RegisterPayload,
  RegistrationPending,
  TokenPair,
  User,
} from '../models/user.model';
import { TokenService } from './token.service';

const USER_KEY = 'earnlens.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}${environment.apiPrefix}/auth`;

  private readonly userSignal = signal<User | null>(this.readUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null && this.tokens.hasSession());

  /**
   * Step 1 of registration — submits the form. The backend stages the
   * details and emails a one-time code; no session is created yet.
   */
  register(payload: RegisterPayload): Observable<RegistrationPending> {
    return this.http
      .post<ApiResponse<RegistrationPending>>(`${this.base}/register`, payload)
      .pipe(map((r) => r.data));
  }

  /**
   * Step 2 — confirms the emailed OTP. On success the account is created
   * and the returned session is persisted.
   */
  verifyRegistration(registration_id: string, otp: string): Observable<AuthResult> {
    return this.http
      .post<ApiResponse<AuthResult>>(`${this.base}/register/verify`, { registration_id, otp })
      .pipe(map((r) => r.data), tap((result) => this.persist(result)));
  }

  /** Requests a fresh OTP for an in-flight registration. */
  resendRegistrationOtp(registration_id: string): Observable<RegistrationPending> {
    return this.http
      .post<ApiResponse<RegistrationPending>>(`${this.base}/register/resend-otp`, { registration_id })
      .pipe(map((r) => r.data));
  }

  login(payload: LoginPayload): Observable<AuthResult> {
    return this.http
      .post<ApiResponse<AuthResult>>(`${this.base}/login`, payload)
      .pipe(map((r) => r.data), tap((result) => this.persist(result)));
  }

  refresh(): Observable<TokenPair> {
    const refresh_token = this.tokens.getRefreshToken();
    return this.http
      .post<ApiResponse<TokenPair>>(`${this.base}/refresh`, { refresh_token })
      .pipe(map((r) => r.data), tap((pair) => this.tokens.setTokens(pair)));
  }

  forgotPassword(email: string): Observable<{ reset_token: string | null }> {
    return this.http
      .post<ApiResponse<{ reset_token: string | null }>>(`${this.base}/forgot-password`, { email })
      .pipe(map((r) => r.data));
  }

  resetPassword(token: string, new_password: string, confirm_new_password: string): Observable<unknown> {
    return this.http.post(`${this.base}/reset-password`, { token, new_password, confirm_new_password });
  }

  logout(redirect = true): void {
    const refresh_token = this.tokens.getRefreshToken();
    if (refresh_token) {
      this.http.post(`${this.base}/logout`, { refresh_token }).subscribe({
        error: () => void 0,
      });
    }
    this.clearSession();
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  clearSession(): void {
    this.tokens.clear();
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private persist(result: AuthResult): void {
    this.tokens.setTokens(result.tokens);
    this.setUser(result.user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
