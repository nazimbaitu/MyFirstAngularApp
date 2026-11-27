import { Injectable, inject } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Payment } from '../models/payment.model';
import { CalcService } from './calc.service';
import { DataService } from './data.service';
import { ToastService } from './toast.service';
import { fmtAmount, fmtDateTime } from '../utils/formatters';

const DEFAULT_PAYMENT_TEMPLATE =
  'Hello {customerName}, we received your payment of {amount} on {date}. Your current balance is {balance}. Thank you, {shopName}.';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly data = inject(DataService);
  private readonly calc = inject(CalcService);
  private readonly toast = inject(ToastService);

  sendPaymentReceipt(payment: Payment): void {
    const customer = this.data.getCustomers().find(item => item.id === payment.customerId);
    if (!customer) {
      this.toast.show('WhatsApp Unavailable', 'Customer details were not found.', 'error');
      return;
    }

    const mobile = this.normalizeMobile(customer.mobile);
    if (mobile.length < 7 || mobile.length > 15) {
      this.toast.show('WhatsApp Unavailable', 'Enter a valid customer mobile number with its country code.', 'error');
      return;
    }

    const settings = this.data.getSettings();
    const values: Record<string, string> = {
      customerName: customer.name,
      amount: fmtAmount(payment.amount),
      date: fmtDateTime(payment.dateTime),
      balance: fmtAmount(this.calc.customerBalance(customer.id)),
      paymentMethod: payment.method,
      shopName: settings.shopName,
    };
    const template = settings.whatsAppPaymentTemplate?.trim() || DEFAULT_PAYMENT_TEMPLATE;
    const message = template.replace(/\{([^{}]+)\}/g, (token, key: string) => values[key] ?? token);
    const url = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;
    if (typeof document === 'undefined') {
      this.toast.show('WhatsApp Unavailable', 'This action is only available in a browser.', 'error');
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }

  private normalizeMobile(mobile: string): string {
    const digits = mobile.replace(/\D/g, '');
    if (mobile.trim().startsWith('+')) return digits;
    if (digits.startsWith('00')) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) return `92${digits.slice(1)}`;
    return digits;
  }
}
