import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, forkJoin, map, of, tap, throwError } from 'rxjs';
import { Customer } from '../models/customer.model';
import { Employee } from '../models/employee.model';
import { AppNotification } from '../models/notification.model';
import { Payment } from '../models/payment.model';
import { ShopSettings, UserProfile } from '../models/settings.model';
import { Transaction } from '../models/transaction.model';
import {
  CustomerDto,
  EmployeeDto,
  NotificationDto,
  PaymentDto,
  ShopSettingsDto,
  TransactionDto,
} from '../models/api.models';
import { ApiService, apiErrorMessage } from './api.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly api = inject(ApiService);
  private customers: Customer[] = [];
  private transactions: Transaction[] = [];
  private payments: Payment[] = [];
  private employees: Employee[] = [];
  private notifications: AppNotification[] = [];
  private settings: ShopSettings = emptySettings();
  private profile: UserProfile = emptyProfile();
  private initialized = false;
  private readonly loadingSubject = new BehaviorSubject(false);
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>([]);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly notifications$ = this.notificationsSubject.asObservable();

  loadAll(force = false): Observable<void> {
    if (this.initialized && !force) return of(undefined);
    this.loadingSubject.next(true);
    return forkJoin({
      customers: this.api.get<CustomerDto[]>('/customers'),
      transactions: this.api.get<TransactionDto[]>('/transactions'),
      payments: this.api.get<PaymentDto[]>('/payments'),
      employees: this.api.get<EmployeeDto[]>('/employees'),
      notifications: this.api.get<NotificationDto[]>('/notifications'),
      settings: this.api.get<ShopSettingsDto>('/settings'),
      profile: this.api.get<EmployeeDto>('/profile'),
    }).pipe(
      tap(result => {
        this.customers = result.customers.map(mapCustomer);
        this.transactions = result.transactions.map(mapTransaction);
        this.payments = result.payments.map(mapPayment);
        this.employees = result.employees.map(mapEmployee);
        this.setNotifications(result.notifications.map(mapNotification));
        this.settings = mapSettings(result.settings, result.profile.name);
        this.profile = mapProfile(result.profile);
        this.initialized = true;
      }),
      map(() => undefined),
      catchError(error => throwError(() => new Error(apiErrorMessage(error)))),
      finalize(() => this.loadingSubject.next(false)),
    );
  }

  reloadCustomers(): Observable<Customer[]> {
    return this.api.get<CustomerDto[]>('/customers').pipe(
      map(items => items.map(mapCustomer)),
      tap(items => { this.customers = items; }),
    );
  }

  reloadTransactions(): Observable<Transaction[]> {
    return this.api.get<TransactionDto[]>('/transactions').pipe(
      map(items => items.map(mapTransaction)),
      tap(items => { this.transactions = items; }),
    );
  }

  reloadPayments(): Observable<Payment[]> {
    return this.api.get<PaymentDto[]>('/payments').pipe(
      map(items => items.map(mapPayment)),
      tap(items => { this.payments = items; }),
    );
  }

  reloadEmployees(): Observable<Employee[]> {
    return this.api.get<EmployeeDto[]>('/employees').pipe(
      map(items => items.map(mapEmployee)),
      tap(items => { this.employees = items; }),
    );
  }

  reloadNotifications(): Observable<AppNotification[]> {
    return this.api.get<NotificationDto[]>('/notifications').pipe(
      map(items => items.map(mapNotification)),
      tap(items => this.setNotifications(items)),
    );
  }

  reloadSettings(): Observable<ShopSettings> {
    return forkJoin({
      settings: this.api.get<ShopSettingsDto>('/settings'),
      profile: this.api.get<EmployeeDto>('/profile'),
    }).pipe(
      map(result => mapSettings(result.settings, result.profile.name)),
      tap(settings => { this.settings = settings; }),
    );
  }

  reloadProfile(): Observable<UserProfile> {
    return this.api.get<EmployeeDto>('/profile').pipe(
      map(mapProfile),
      tap(profile => { this.profile = profile; }),
    );
  }

  getCustomers(): Customer[] { return this.customers; }
  getTransactions(): Transaction[] { return this.transactions; }
  getPayments(): Payment[] { return this.payments; }
  getEmployees(): Employee[] { return this.employees; }
  getNotifications(): AppNotification[] { return this.notifications; }
  getSettings(): ShopSettings { return this.settings; }
  saveSettings(settings: ShopSettings): void { this.settings = settings; }
  getProfile(): UserProfile { return this.profile; }
  saveProfile(profile: UserProfile): void { this.profile = profile; }

  clear(): void {
    this.initialized = false;
    this.customers = [];
    this.transactions = [];
    this.payments = [];
    this.employees = [];
    this.setNotifications([]);
    this.settings = emptySettings();
    this.profile = emptyProfile();
  }

  private setNotifications(items: AppNotification[]): void {
    this.notifications = items;
    this.notificationsSubject.next(items);
  }
}

function mapCustomer(item: CustomerDto): Customer {
  return {
    id: item.id, name: item.name, mobile: item.mobile, address: item.address ?? undefined,
    openingBalance: item.openingBalance, notes: item.notes ?? undefined,
    createdDate: item.createdAtUtc, status: recordStatus(item.status),
  };
}

function mapTransaction(item: TransactionDto): Transaction {
  return {
    id: item.id, reference: item.reference, customerId: item.customerId, dateTime: item.dateTimeUtc,
    items: item.items.map(value => ({
      desc: value.description, qty: value.quantity, price: value.unitPrice, total: value.total,
    })),
    total: item.total, notes: item.notes ?? undefined, createdBy: item.createdBy,
    status: enumValue(item.status) === '1' || enumValue(item.status).toLowerCase() === 'cancelled'
      ? 'Cancelled' : 'Completed',
    reversed: item.reversed,
  };
}

function mapPayment(item: PaymentDto): Payment {
  const method = enumValue(item.method);
  const methods = ['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Other', 'Card', 'Upi'];
  return {
    id: item.id, reference: item.reference, customerId: item.customerId, amount: item.amount,
    dateTime: item.dateTimeUtc, method: methods[Number(method)] ?? method,
    refNumber: item.referenceNumber ?? undefined, notes: item.notes ?? undefined,
    createdBy: item.createdBy, status: 'Completed',
  };
}

function mapEmployee(item: EmployeeDto): Employee {
  const role = enumValue(item.role);
  return {
    id: item.id, name: item.name, username: item.userName, mobile: item.mobile ?? undefined,
    role: role === '0' || role.toLowerCase() === 'owner' ? 'Owner / Admin' : 'Employee / Cashier',
    status: recordStatus(item.status), createdDate: item.createdAtUtc,
  };
}

function mapNotification(item: NotificationDto): AppNotification {
  return {
    id: item.id, type: 'info', title: item.title, message: item.message,
    time: item.createdAtUtc, read: item.isRead,
  };
}

function mapSettings(item: ShopSettingsDto, ownerName: string): ShopSettings {
  return {
    shopName: item.shopName, ownerName, mobile: item.phone ?? '', address: item.address ?? '',
    currency: item.currency, receiptFooter: item.receiptFooter ?? '',
    showMobile: item.showMobile, showAddress: item.showAddress, showFooter: item.showFooter,
  };
}

function mapProfile(item: EmployeeDto): UserProfile {
  const role = enumValue(item.role);
  return {
    name: item.name, username: item.userName,
    role: role === '0' || role.toLowerCase() === 'owner' ? 'Owner / Admin' : 'Employee / Cashier',
    mobile: item.mobile ?? '',
  };
}

function recordStatus(status: number | string): 'Active' | 'Inactive' {
  return enumValue(status) === '1' || enumValue(status).toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
}

function enumValue(value: number | string): string {
  return String(value);
}

function emptySettings(): ShopSettings {
  return {
    shopName: '', ownerName: '', mobile: '', address: '', currency: 'PKR', receiptFooter: '',
    showMobile: true, showAddress: true, showFooter: true,
  };
}

function emptyProfile(): UserProfile {
  return { name: '', username: '', role: '', mobile: '' };
}
