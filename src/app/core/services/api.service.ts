import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/api.models';

const TOKEN_KEY = 'shopkhata_api_token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401 && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    return throwError(() => error);
  }));
};

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Cannot reach the ShopKhata API. Check that the backend is running and CORS allows this frontend origin.';
    const problem = error.error as { detail?: string; title?: string } | null;
    return problem?.detail || problem?.title || error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  login(userName: string, password: string): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', { userName, password }).pipe(
      tap(result => {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(TOKEN_KEY, result.accessToken);
      }),
    );
  }

  isAuthenticated(): boolean {
    return typeof sessionStorage !== 'undefined' && Boolean(sessionStorage.getItem(TOKEN_KEY));
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(TOKEN_KEY);
  }
}
