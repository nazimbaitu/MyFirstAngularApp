import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('shopkhata_api_token');
  });

  it('uses the configured API base URL for GET requests', () => {
    let response: unknown;
    api.get<unknown[]>('/customers').subscribe(value => response = value);
    const request = http.expectOne(`${environment.apiUrl}/customers`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
    expect(response).toEqual([]);
  });

  it('sends the entered credentials and stores the returned token', () => {
    api.login('operator', 'entered-password').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ userName: 'operator', password: 'entered-password' });
    request.flush({
      accessToken: 'test-token', userId: 'user-id', shopId: 'shop-id',
      userName: 'operator', role: 0,
    });
    expect(sessionStorage.getItem('shopkhata_api_token')).toBe('test-token');
  });
});
