export type ApiEnum = number | string;

export interface AuthResponse {
  accessToken: string;
  userId: string;
  shopId: string;
  userName: string;
  role: ApiEnum;
}

export interface CustomerDto {
  id: string;
  name: string;
  mobile: string;
  address: string | null;
  openingBalance: number;
  notes: string | null;
  status: ApiEnum;
  createdAtUtc: string;
}

export interface TransactionItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TransactionDto {
  id: string;
  reference: string;
  customerId: string;
  dateTimeUtc: string;
  items: TransactionItemDto[];
  total: number;
  notes: string | null;
  createdBy: string;
  status: ApiEnum;
  reversed: boolean;
}

export interface PaymentDto {
  id: string;
  reference: string;
  customerId: string;
  amount: number;
  dateTimeUtc: string;
  method: ApiEnum;
  referenceNumber: string | null;
  notes: string | null;
  createdBy: string;
}

export interface EmployeeDto {
  id: string;
  name: string;
  userName: string;
  mobile: string | null;
  role: ApiEnum;
  status: ApiEnum;
  createdAtUtc: string;
}

export interface ShopSettingsDto {
  shopName: string;
  phone: string | null;
  currency: string;
  address: string | null;
  receiptFooter: string | null;
  showMobile: boolean;
  showAddress: boolean;
  showFooter: boolean;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface OutstandingDto {
  customerId: string;
  customerName: string;
  mobile: string;
  balance: number;
}

export interface ReportSummaryDto {
  date: string;
  sales: number;
  payments: number;
  transactions: number;
  customers: number;
}

export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  address: string | null;
  openingBalance: number;
  notes: string | null;
}

export interface CreateTransactionRequest {
  customerId: string;
  dateTimeUtc: string;
  items: TransactionItemDto[];
  notes: string | null;
}

export interface CreatePaymentRequest {
  customerId: string;
  amount: number;
  dateTimeUtc: string;
  method: number;
  referenceNumber: string | null;
  notes: string | null;
}

export interface CreateEmployeeRequest {
  name: string;
  userName: string;
  mobile: string | null;
  role: number;
  password: string;
}
