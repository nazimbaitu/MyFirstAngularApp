import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('refreshes a stale token and retries the original payment request once', async () => {
    localStorage.setItem('shopkhata_api_token', 'expired-token');
    const body = { customerId: 'customer-1', amount: 100 };
    const savedPayment = { id: 'payment-1', ...body };
    const result = api.post('/payments', body);

    await new Promise(resolve => setTimeout(resolve, 0));
    const firstRequest = http.expectOne('http://localhost:5116/api/payments');
    expect(firstRequest.request.headers.get('Authorization')).toBe('Bearer expired-token');
    firstRequest.flush({ title: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    await new Promise(resolve => setTimeout(resolve, 0));
    const loginRequest = http.expectOne('http://localhost:5116/api/auth/login');
    loginRequest.flush({ accessToken: 'fresh-token' });

    await new Promise(resolve => setTimeout(resolve, 0));
    const retryRequest = http.expectOne('http://localhost:5116/api/payments');
    expect(retryRequest.request.method).toBe('POST');
    expect(retryRequest.request.body).toEqual(body);
    expect(retryRequest.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retryRequest.flush(savedPayment);

    await expect(result).resolves.toEqual(savedPayment);
  });
});