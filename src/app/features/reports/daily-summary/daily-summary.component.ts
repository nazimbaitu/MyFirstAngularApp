import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { ReportSummaryDto } from '../../../core/models/api.models';
import { Transaction } from '../../../core/models/transaction.model';
import { Payment } from '../../../core/models/payment.model';
import { todayISO, fmtDateTime } from '../../../core/utils/formatters';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-daily-summary',
  standalone: true,
  imports: [FormsModule, CurrencyFormatPipe, EmptyStateComponent],
  template: `
    <div class="page-head"><h1>Daily Summary</h1><input type="date" [(ngModel)]="date" (change)="load()"></div>
    @if (loading) { <p role="status">Loading report…</p> }
    @if (error) { <p class="field-error" role="alert">{{error}}</p> }
    @if (!loading && !error) {
      <div class="stats-grid">
        <div class="stat-card orange"><span>Khata Entries</span><strong>{{summary?.transactions ?? 0}}</strong><small>{{(summary?.sales ?? 0)|currencyFormat}}</small></div>
        <div class="stat-card green"><span>Payments</span><strong>{{payments.length}}</strong><small>{{(summary?.payments ?? 0)|currencyFormat}}</small></div>
        <div class="stat-card"><span>Net (Payments - Entries)</span><strong [class.text-red]="net<0" [class.text-green]="net>=0">{{net|currencyFormat}}</strong></div>
      </div>
      <div class="card"><h3 class="card-title">Transactions</h3>@if(transactions.length){<div class="table-wrap"><table class="data-table"><thead><tr><th>Reference</th><th>Customer</th><th>Items</th><th>Amount</th><th>Time</th></tr></thead><tbody>@for(t of transactions;track t.id){<tr><td>{{t.reference}}</td><td>{{customerName(t.customerId)}}</td><td>{{items(t)}}</td><td class="amount">{{t.total|currencyFormat}}</td><td>{{fmtDate(t.dateTime)}}</td></tr>}</tbody></table></div>} @else {<app-empty-state icon="fa-exchange-alt" title="No transactions" message="No transactions were recorded on this date."></app-empty-state>}</div>
      <div class="card"><h3 class="card-title">Payments</h3>@if(payments.length){<div class="table-wrap"><table class="data-table"><thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Method</th><th>Time</th></tr></thead><tbody>@for(p of payments;track p.id){<tr><td>{{p.reference}}</td><td>{{customerName(p.customerId)}}</td><td class="amount text-green">{{p.amount|currencyFormat}}</td><td>{{p.method}}</td><td>{{fmtDate(p.dateTime)}}</td></tr>}</tbody></table></div>} @else {<app-empty-state icon="fa-money-bill-wave" title="No payments" message="No payments were recorded on this date."></app-empty-state>}</div>
    }
  `,
})
export class DailySummaryComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly api = inject(ApiService);
  date = todayISO();
  transactions: Transaction[] = [];
  payments: Payment[] = [];
  summary: ReportSummaryDto | null = null;
  loading = false;
  error = '';
  readonly fmtDate = fmtDateTime;
  get net(): number { return (this.summary?.payments ?? 0) - (this.summary?.sales ?? 0); }

  ngOnInit(): void {
    this.layout.setTitle('Daily Summary');
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.summary = await firstValueFrom(this.api.get<ReportSummaryDto>(
        '/reports/daily', new HttpParams().set('date', this.date),
      ));
      this.transactions = this.data.getTransactions().filter(tx =>
        tx.status === 'Completed' && !tx.reversed && tx.dateTime.slice(0, 10) === this.date,
      );
      this.payments = this.data.getPayments().filter(payment =>
        payment.dateTime.slice(0, 10) === this.date,
      );
    } catch (error) {
      this.error = apiErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  customerName(id: string): string {
    return this.data.getCustomers().find(customer => customer.id === id)?.name ?? 'Unknown';
  }

  items(transaction: Transaction): string {
    return transaction.items.map(item => item.desc).join(', ');
  }
}
