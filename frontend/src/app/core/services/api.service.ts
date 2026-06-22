import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.model';

/**
 * Thin HTTP wrapper that prefixes the API base URL and unwraps the
 * standard ``{ success, data }`` envelope so feature services receive
 * clean domain objects.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${environment.apiPrefix}`;

  private url(path: string): string {
    return `${this.base}${path}`;
  }

  toParams(query: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.url(path), { params })
      .pipe(map((res) => res.data));
  }

  getPaginated<T>(path: string, params?: HttpParams): Observable<PaginatedResponse<T>> {
    return this.http.get<PaginatedResponse<T>>(this.url(path), { params });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(this.url(path))
      .pipe(map((res) => res.data));
  }

  /** Raw GET for non-enveloped responses (e.g. file downloads). */
  getBlob(path: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(this.url(path), { params, responseType: 'blob' });
  }

  /** Raw POST that resolves a binary payload (e.g. a generated PDF). */
  postBlob(path: string, body: unknown, params?: HttpParams): Observable<Blob> {
    return this.http.post(this.url(path), body, { params, responseType: 'blob' });
  }
}
