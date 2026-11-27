import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { Payment } from '../models/payment.model';
import { Employee } from '../models/employee.model';
import { AppNotification } from '../models/notification.model';
import { ShopSettings, ReceiptSettings, UserProfile } from '../models/settings.model';

const V = 'v1';
const KEYS = {
  SETTINGS: `shopkhata_settings_${V}`, RECEIPT: `shopkhata_receipt_${V}`, CUSTOMERS: `shopkhata_customers_${V}`,
  TRANSACTIONS: `shopkhata_transactions_${V}`, PAYMENTS: `shopkhata_payments_${V}`, EMPLOYEES: `shopkhata_employees_${V}`,
  NOTIFICATIONS: `shopkhata_notifications_${V}`, PROFILE: `shopkhata_profile_${V}`, INITIALIZED: `shopkhata_initialized_${V}`,
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private storage = inject(StorageService);
  getSettings(): ShopSettings { return this.storage.get(KEYS.SETTINGS, { shopName:'ShopKhata', ownerName:'Muhammad Aslam', logo:'', mobile:'0300-1234567', address:'Main Bazaar, Lahore, Pakistan', currency:'PKR', receiptFooter:'Thank you for your business!', whatsAppPaymentTemplate:'' }); }
  saveSettings(s: ShopSettings): void { this.storage.set(KEYS.SETTINGS, s); }
  getReceiptSettings(): ReceiptSettings { return this.storage.get(KEYS.RECEIPT, { showMobile:true, showAddress:true, showFooter:true }); }
  saveReceiptSettings(s: ReceiptSettings): void { this.storage.set(KEYS.RECEIPT, s); }
  getProfile(): UserProfile { return this.storage.get(KEYS.PROFILE, { name:'Ahmed Raza', username:'admin', role:'Owner / Admin', mobile:'0300-7654321' }); }
  saveProfile(p: UserProfile): void { this.storage.set(KEYS.PROFILE, p); }
  getCustomers(): Customer[] { return this.storage.get(KEYS.CUSTOMERS, []); }
  saveCustomers(list: Customer[]): void { this.storage.set(KEYS.CUSTOMERS, list); }
  getTransactions(): Transaction[] { return this.storage.get(KEYS.TRANSACTIONS, []); }
  saveTransactions(list: Transaction[]): void { this.storage.set(KEYS.TRANSACTIONS, list); }
  getPayments(): Payment[] { return this.storage.get(KEYS.PAYMENTS, []); }
  savePayments(list: Payment[]): void { this.storage.set(KEYS.PAYMENTS, list); }
  getEmployees(): Employee[] { return this.storage.get(KEYS.EMPLOYEES, []); }
  saveEmployees(list: Employee[]): void { this.storage.set(KEYS.EMPLOYEES, list); }
  getNotifications(): AppNotification[] { return this.storage.get(KEYS.NOTIFICATIONS, []); }
  saveNotifications(list: AppNotification[]): void { this.storage.set(KEYS.NOTIFICATIONS, list); }
  isInitialized(): boolean { return this.storage.get(KEYS.INITIALIZED, false); }
  markInitialized(): void { this.storage.set(KEYS.INITIALIZED, true); }
  resetAll(): void { Object.values(KEYS).forEach(k => this.storage.remove(k)); }
  // Expose keys for demo seeding
  static readonly storageKeys = KEYS;
}
