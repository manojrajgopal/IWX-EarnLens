import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

interface ApiErrorBody {
  error?: { message?: string };
}

/** Surfaces meaningful error messages as toasts (except handled 401s). */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401s are handled by the auth interceptor's refresh flow.
      if (error.status !== 401) {
        const body = error.error as ApiErrorBody | string | null;
        let message = 'Something went wrong. Please try again.';
        if (typeof body === 'object' && body?.error?.message) {
          message = body.error.message;
        } else if (error.status === 0) {
          message = 'Cannot reach the server. Is the backend running?';
        }
        toast.error(message);
      }
      return throwError(() => error);
    }),
  );
};
