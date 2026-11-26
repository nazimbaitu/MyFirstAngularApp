import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5116/api';
  private authPromise: Promise<void> | null = null;

  async ensureAuthenticated(): Promise<void> {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('shopkhata_api_token')) return;
    if (!this.authPromise) {
      this.authPromise = firstValueFrom(this.http.post<any>(`${this.baseUrl}/auth/login`, {
        userName: 'admin',
        password: 'Admin@123',
      })).then(result => {
        if (typeof localStorage !== 'undefined') localStorage.setItem('shopkhata_api_token', result.accessToken);
      }).catch(error => {
        throw new Error(error?.error?.detail || error?.error?.title || 'Cannot connect to the ShopKhata API');
      }).finally(() => {
        this.authPromise = null;
      });
    }
    await this.authPromise;
  }

  private async headers(): Promise<HttpHeaders> {
    await this.ensureAuthenticated();
    const token = typeof localStorage === 'undefined' ? '' : localStorage.getItem('shopkhata_api_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}${path}`, { headers: await this.headers() }));
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.baseUrl}${path}`, body, { headers: await this.headers() }));
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.baseUrl}${path}`, body, { headers: await this.headers() }));
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.patch<T>(`${this.baseUrl}${path}`, body, { headers: await this.headers() }));
  }
}
