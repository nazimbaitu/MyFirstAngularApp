import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    component: AppLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'customers', loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent) },
      { path: 'customers/add', loadComponent: () => import('./features/customers/customer-add/customer-add.component').then(m => m.CustomerAddComponent) },
      { path: 'khata/new', loadComponent: () => import('./features/khata/new-khata/new-khata.component').then(m => m.NewKhataComponent) },
      { path: 'transactions', loadComponent: () => import('./features/khata/transactions/transactions.component').then(m => m.TransactionsComponent) },
      { path: 'ledger', loadComponent: () => import('./features/khata/ledger/ledger.component').then(m => m.LedgerComponent) },
      { path: 'payments/receive', loadComponent: () => import('./features/payments/receive-payment/receive-payment.component').then(m => m.ReceivePaymentComponent) },
      { path: 'payments/history', loadComponent: () => import('./features/payments/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent) },
      { path: 'employees', loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent) },
      { path: 'employees/add', loadComponent: () => import('./features/employees/employee-add/employee-add.component').then(m => m.EmployeeAddComponent) },
      { path: 'reports/daily', loadComponent: () => import('./features/reports/daily-summary/daily-summary.component').then(m => m.DailySummaryComponent) },
      { path: 'reports/monthly', loadComponent: () => import('./features/reports/monthly-summary/monthly-summary.component').then(m => m.MonthlySummaryComponent) },
      { path: 'reports/outstanding', loadComponent: () => import('./features/reports/outstanding/outstanding.component').then(m => m.OutstandingComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'settings/shop', loadComponent: () => import('./features/settings/shop-settings/shop-settings.component').then(m => m.ShopSettingsComponent) },
      { path: 'settings/receipt', loadComponent: () => import('./features/settings/receipt-settings/receipt-settings.component').then(m => m.ReceiptSettingsComponent) },
      { path: 'profile', loadComponent: () => import('./features/settings/profile/profile.component').then(m => m.ProfileComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
