import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LayoutService } from '../../core/services/layout.service';
import { DataService } from '../../core/services/data.service';
import { CalcService } from '../../core/services/calc.service';
import { ApiService, apiErrorMessage } from '../../core/services/api.service';
import { OutstandingDto, ReportSummaryDto } from '../../core/models/api.models';
import { KhataItem } from '../../core/models/transaction.model';
import { fmtDateTime } from '../../core/utils/formatters';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyFormatPipe, EmptyStateComponent],
  template: `
    <div class="page-head"><div><h1>Dashboard</h1><p class="subtitle">ShopKhata overview</p></div></div>
    @if (loading) { <p role="status">Loading dashboard data…</p> }
    @if (error) { <p class="field-error" role="alert">{{error}}</p> }
    @if (!loading && !error) {
      <div class="stats-grid">
        <div class="stat-card"><span>Total Customers</span><strong>{{calc.totalCustomers()}}</strong></div>
        <div class="stat-card red"><span>Outstanding Receivable</span><strong>{{outstandingTotal|currencyFormat}}</strong></div>
        <div class="stat-card orange"><span>Today's Khata Entries</span><strong>{{today?.transactions ?? 0}}</strong><small>{{(today?.sales ?? 0)|currencyFormat}}</small></div>
        <div class="stat-card green"><span>Today's Received</span><strong>{{today?.payments ?? 0|currencyFormat}}</strong></div>
        <div class="stat-card"><span>Total Transactions</span><strong>{{data.getTransactions().length}}</strong></div>
      </div>
      <div class="card"><h3 class="card-title"><i class="fas fa-bolt"></i> Quick Actions</h3><div class="quick-actions"><a class="btn btn-primary" routerLink="/customers/add"><i class="fas fa-user-plus"></i> Add Customer</a><a class="btn btn-primary" routerLink="/khata/new"><i class="fas fa-plus-circle"></i> New Khata Entry</a><a class="btn btn-green" routerLink="/payments/receive"><i class="fas fa-money-bill-wave"></i> Receive Payment</a><a class="btn btn-outline" routerLink="/customers"><i class="fas fa-users"></i> View Customers</a><a class="btn btn-navy" routerLink="/reports/daily"><i class="fas fa-chart-bar"></i> View Reports</a></div></div>
      <div class="card"><h3 class="card-title"><i class="fas fa-chart-line"></i> Last 7 Days Activity</h3><div class="bar-chart">@for (d of chartData; track d.date) { <div class="bar-column"><div class="bar entry" [style.height.%]="d.entryHeight"></div><small>{{d.label}}</small></div> }</div></div>
      <div class="dashboard-grid">
        <div class="card"><h3 class="card-title">Recent Khata Transactions</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Ref</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th></tr></thead><tbody>@for(t of recentTransactions; track t.id){<tr><td>{{t.reference}}</td><td>{{customerName(t.customerId)}}</td><td>{{itemSummary(t.items)}}</td><td class="amount">{{t.total|currencyFormat}}</td><td>{{fmtDate(t.dateTime)}}</td></tr>} @empty {<tr><td colspan="5" class="text-center">No transactions found.</td></tr>}</tbody></table></div></div>
        <div class="card"><h3 class="card-title">Recent Payments</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Ref</th><th>Customer</th><th>Amount</th><th>Date</th></tr></thead><tbody>@for(p of recentPayments; track p.id){<tr><td>{{p.reference}}</td><td>{{customerName(p.customerId)}}</td><td class="amount text-green">{{p.amount|currencyFormat}}</td><td>{{fmtDate(p.dateTime)}}</td></tr>} @empty {<tr><td colspan="4" class="text-center">No payments found.</td></tr>}</tbody></table></div></div>
      </div>
      <div class="card"><h3 class="card-title">Top Outstanding</h3>@if(topOutstanding.length){<div class="table-wrap"><table class="data-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Balance</th><th>Action</th></tr></thead><tbody>@for(c of topOutstanding; track c.customerId){<tr><td>{{c.customerName}}</td><td>{{c.mobile}}</td><td class="amount text-red">{{c.balance|currencyFormat}}</td><td><a class="btn btn-xs btn-outline" [routerLink]="['/ledger']" [queryParams]="{customer:c.customerId}">Ledger</a></td></tr>}</tbody></table></div>} @else {<app-empty-state icon="fa-circle-check" title="No outstanding balances" message="There are no customers with outstanding balances."></app-empty-state>}</div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  readonly data = inject(DataService);
  readonly calc = inject(CalcService);
  private readonly layout = inject(LayoutService);
  private readonly api = inject(ApiService);
  readonly fmtDate = fmtDateTime;
  today: ReportSummaryDto | null = null;
  recentTransactions: ReturnType<DataService['getTransactions']> = [];
  recentPayments: ReturnType<DataService['getPayments']> = [];
  topOutstanding: OutstandingDto[] = [];
  chartData: { date: string; label: string; entryHeight: number }[] = [];
  outstandingTotal = 0;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.layout.setTitle('Dashboard');
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const params = new HttpParams().set('date', new Date().toISOString().slice(0, 10));
      const { today, outstanding } = await firstValueFrom(forkJoin({
        today: this.api.get<ReportSummaryDto>('/reports/daily', params),
        outstanding: this.api.get<OutstandingDto[]>('/reports/outstanding'),
      }));
      this.today = today;
      this.topOutstanding = outstanding.filter(item => item.balance > 0)
        .sort((a, b) => b.balance - a.balance).slice(0, 5);
      this.outstandingTotal = outstanding.reduce((sum, item) => sum + item.balance, 0);
      this.recentTransactions = [...this.data.getTransactions()]
        .sort((a, b) => b.dateTime.localeCompare(a.dateTime)).slice(0, 5);
      this.recentPayments = [...this.data.getPayments()]
        .sort((a, b) => b.dateTime.localeCompare(a.dateTime)).slice(0, 5);
      this.buildChart();
    } catch (error) {
      this.error = apiErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  customerName(id: string): string {
    return this.data.getCustomers().find(customer => customer.id === id)?.name ?? 'Unknown';
  }

  itemSummary(items: KhataItem[]): string {
    return items.map(item => item.desc).join(', ').slice(0, 60);
  }

  private buildChart(): void {
    const amounts: number[] = [];
    this.chartData = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      const amount = this.data.getTransactions()
        .filter(tx => tx.status === 'Completed' && !tx.reversed && tx.dateTime.slice(0, 10) === key)
        .reduce((sum, tx) => sum + tx.total, 0);
      amounts.push(amount);
      this.chartData.push({
        date: key, label: date.toLocaleDateString('en-PK', { weekday: 'short' }),
        entryHeight: 0,
      });
    }
    const max = Math.max(1, ...amounts);
    this.chartData = this.chartData.map((item, index) => ({
      ...item, entryHeight: amounts[index] / max * 100,
    }));
  }
}
