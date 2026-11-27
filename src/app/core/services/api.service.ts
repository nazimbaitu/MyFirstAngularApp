import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

interface AuthResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5116/api';
  private readonly tokenKey = 'shopkhata_api_token';
  private authPromise: Promise<void> | null = null;
  private refreshPromise: Promise<void> | null = null;

  async ensureAuthenticated(): Promise<void> {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(this.tokenKey)) return;
    await this.authenticate();
  }

  private authenticate(): Promise<void> {
    if (!this.authPromise) {
      this.authPromise = firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, {
        userName: 'admin',
        password: 'Admin@123',
      }))
        .then(result => {
          if (!result.accessToken) throw new Error('The ShopKhata API did not return an access token.');
          if (typeof localStorage !== 'undefined') localStorage.setItem(this.tokenKey, result.accessToken);
        })
        .catch((error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            const detail = error.error?.detail || error.error?.title;
            throw new Error(detail || error.message);
          }
          throw error;
        })
        .finally(() => {
          this.authPromise = null;
        });
    }
    return this.authPromise;
  }

  private async headers(): Promise<HttpHeaders> {
    await this.ensureAuthenticated();
    const token = typeof localStorage === 'undefined' ? '' : localStorage.getItem(this.tokenKey) || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private clearToken(): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(this.tokenKey);
  }

  private async refreshAuthentication(): Promise<void> {
    if (!this.refreshPromise) {
      this.clearToken();
      this.refreshPromise = this.authenticate().finally(() => {
        this.refreshPromise = null;
      });
    }
    await this.refreshPromise;
  }

  private async authorizedRequest<T>(send: (headers: HttpHeaders) => Observable<T>): Promise<T> {
    const sendWithCurrentToken = async () => firstValueFrom(send(await this.headers()));
    try {
      return await sendWithCurrentToken();
    } catch (error) {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) throw error;

      await this.refreshAuthentication();
      try {
        return await sendWithCurrentToken();
      } catch (retryError) {
        if (retryError instanceof HttpErrorResponse && retryError.status === 401) this.clearToken();
        throw retryError;
      }
    }
  }

  async get<T>(path: string): Promise<T> {
    return this.authorizedRequest(headers => this.http.get<T>(`${this.baseUrl}${path}`, { headers }));
  }

  assetUrl(path: string): string {
    return new URL(path, this.baseUrl.replace(/\/api$/, '')).toString();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.authorizedRequest(headers => this.http.post<T>(`${this.baseUrl}${path}`, body, { headers }));
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.authorizedRequest(headers => this.http.put<T>(`${this.baseUrl}${path}`, body, { headers }));
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.authorizedRequest(headers => this.http.patch<T>(`${this.baseUrl}${path}`, body, { headers }));
  }
}
