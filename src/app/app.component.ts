import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './core/services/data.service';
import { initDemoData } from './core/demo-data';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  private data = inject(DataService);
  private api = inject(ApiService);
  ngOnInit(): void {
    initDemoData(this.data);
    void this.syncFromApi();
  }

  private async syncFromApi(): Promise<void> {
    try {
      const [customers, transactions, payments, employees, notifications, settings, profile] = await Promise.all([
        this.api.get<any[]>('/customers'),
        this.api.get<any[]>('/transactions'),
        this.api.get<any[]>('/payments'),
        this.api.get<any[]>('/employees'),
        this.api.get<any[]>('/notifications'),
        this.api.get<any>('/settings'),
        this.api.get<any>('/profile'),
      ]);
      this.data.saveCustomers(customers.map(x => ({
        id: x.id, name: x.name, mobile: x.mobile, secondaryMobile: x.secondaryMobile,
        additionalMobile: x.additionalMobile, photoUrl: x.photoUrl, address: x.address,
        openingBalance: x.openingBalance, notes: x.notes, createdDate: x.createdAtUtc,
        status: x.status === 1 || x.status === 'Inactive' ? 'Inactive' : 'Active',
      })));
      this.data.saveTransactions(transactions.map(x => ({
        id: x.id, reference: x.reference, customerId: x.customerId, dateTime: x.dateTimeUtc,
        items: x.items.map((item: any) => ({ desc: item.description, qty: item.quantity, price: item.unitPrice, total: item.total })),
        total: x.total, notes: x.notes, createdBy: x.createdBy,
        status: x.status === 1 || x.status === 'Cancelled' ? 'Cancelled' : 'Completed', reversed: x.reversed,
      })));
      this.data.savePayments(payments.map(x => ({
        id: x.id, reference: x.reference, customerId: x.customerId, amount: x.amount,
        dateTime: x.dateTimeUtc, method: x.method === 1 || x.method === 'BankTransfer' ? 'Bank Transfer' : x.method === 2 || x.method === 'EasyPaisa' ? 'EasyPaisa' : x.method === 3 || x.method === 'JazzCash' ? 'JazzCash' : x.method === 4 || x.method === 'Other' ? 'Other' : 'Cash', refNumber: x.referenceNumber,
        notes: x.notes, createdBy: x.createdBy, status: 'Completed',
      })));
      this.data.saveEmployees(employees.map(x => ({
        id: x.id, name: x.name, username: x.userName, mobile: x.mobile,
        role: x.role === 0 || x.role === 'Owner' ? 'Owner / Admin' : 'Employee / Cashier',
        status: x.status === 1 || x.status === 'Inactive' ? 'Inactive' : 'Active', createdDate: x.createdAtUtc,
      })));
      this.data.saveNotifications(notifications.map((x: any) => ({
        id: x.id, type: 'info', title: x.title, message: x.message,
        time: x.createdAtUtc, read: x.isRead,
      })));
      this.data.saveSettings({
        shopName: settings.shopName, ownerName: profile.name, logo: '',
        mobile: settings.phone || '', address: settings.address || '',
        currency: settings.currency, receiptFooter: settings.receiptFooter || '',
        whatsAppPaymentTemplate: settings.whatsAppPaymentTemplate || '',
      });
      this.data.saveProfile({
        name: profile.name, username: profile.userName,
        role: profile.role === 0 || profile.role === 'Owner' ? 'Owner / Admin' : 'Employee / Cashier',
        mobile: profile.mobile || '',
      });
    } catch {
      // Demo/local data remain available if the API is not running.
    }
  }
}
