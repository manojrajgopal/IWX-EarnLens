import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, timeout } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

/** Upper bound for a single token-refresh + replay so requests never hang. */
const REFRESH_TIMEOUT_MS = 20_000;

const AUTH_EXEMPT = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

function isExempt(url: string): boolean {
  return AUTH_EXEMPT.some((path) => url.includes(path));
}

/**
 * Attaches the bearer access token and transparently refreshes it once
 * on a 401, replaying the original request with the new token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const auth = inject(AuthService);

  const accessToken = tokens.getAccessToken();
  const authReq =
    accessToken && !isExempt(req.url)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isExempt(req.url) || !tokens.getRefreshToken()) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshedToken$.pipe(
          filter((token): token is string => token !== null),
          take(1),
          timeout(REFRESH_TIMEOUT_MS),
          switchMap((token) =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
          ),
        );
      }

      isRefreshing = true;
      refreshedToken$.next(null);

      return auth.refresh().pipe(
        timeout(REFRESH_TIMEOUT_MS),
        switchMap((pair) => {
          isRefreshing = false;
          refreshedToken$.next(pair.access_token);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${pair.access_token}` } }));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshedToken$.next(null);
          auth.clearSession();
          auth.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
