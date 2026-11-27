import { TestBed } from '@angular/core/testing';
import { Customer } from '../models/customer.model';
import { Payment } from '../models/payment.model';
import { CalcService } from './calc.service';
import { DataService } from './data.service';
import { ToastService } from './toast.service';
import { WhatsAppService } from './whatsapp.service';
import { fmtAmount } from '../utils/formatters';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  const customer: Customer = {
    id: 'NK000001',
    name: 'Ada Khan',
    mobile: '0300-123-4567',
    openingBalance: 0,
    createdDate: '2026-01-01',
    status: 'Active',
  };
  const payment: Payment = {
    id: 'payment-1',
    reference: 'PM-001',
    customerId: customer.id,
    amount: 1250,
    dateTime: '2026-11-27T10:00:00Z',
    method: 'Cash',
    createdBy: 'owner-1',
    status: 'Completed',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WhatsAppService,
        { provide: DataService, useValue: { getCustomers: () => [customer], getSettings: () => ({
          shopName: 'Ada Store',
          whatsAppPaymentTemplate: 'Paid {amount} for {customerName} via {paymentMethod}; balance {balance}; shop {shopName}',
        }) } },
        { provide: CalcService, useValue: { customerBalance: () => 450 } },
        { provide: ToastService, useValue: { show: vi.fn() } },
      ],
    });
    service = TestBed.inject(WhatsAppService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a prefilled WhatsApp message using the saved template and local mobile format', () => {
    let openedUrl = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      openedUrl = this.href;
    });

    service.sendPaymentReceipt(payment);

    const url = new URL(openedUrl);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/923001234567');
    expect(url.searchParams.get('text')).toContain(`Paid ${fmtAmount(payment.amount)} for Ada Khan via Cash`);
    expect(url.searchParams.get('text')).toContain(`balance ${fmtAmount(450)}; shop Ada Store`);
  });
});
