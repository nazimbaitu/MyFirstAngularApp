import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { ReportSummaryDto } from '../../../core/models/api.models';
import { todayISO } from '../../../core/utils/formatters';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-monthly-summary',
  standalone: true,
  imports: [FormsModule, CurrencyFormatPipe, EmptyStateComponent],
  template: `
    <div class="page-head"><h1>Monthly Summary</h1><input type="month" [(ngModel)]="month" (change)="load()"></div>
    @if (loading) { <p role="status">Loading report…</p> }
    @if (error) { <p class="field-error" role="alert">{{error}}</p> }
    @if (!loading && !error) {
      <div class="stats-grid"><div class="stat-card orange"><span>Khata Entries</span><strong>{{summary?.transactions ?? 0}}</strong><small>{{(summary?.sales ?? 0)|currencyFormat}}</small></div><div class="stat-card green"><span>Payments</span><strong>{{paymentCount}}</strong><small>{{(summary?.payments ?? 0)|currencyFormat}}</small></div></div>
      @if (days.length) {
        <div class="card table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Entries Amount</th><th>Payments Amount</th></tr></thead><tbody>@for(d of days;track d.date){<tr><td>{{d.date}}</td><td class="amount text-orange">{{d.entries|currencyFormat}}</td><td class="amount text-green">{{d.payments|currencyFormat}}</td></tr>}</tbody></table></div>
      } @else {
        <app-empty-state icon="fa-calendar-alt" title="No activity" message="No transactions or payments were recorded this month."></app-empty-state>
      }
    }
  `,
})
export class MonthlySummaryComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly api = inject(ApiService);
  month = todayISO().slice(0, 7);
  summary: ReportSummaryDto | null = null;
  paymentCount = 0;
  days: { date: string; entries: number; payments: number }[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.layout.setTitle('Monthly Summary');
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const [yearText, monthText] = this.month.split('-');
      const params = new HttpParams().set('year', Number(yearText)).set('month', Number(monthText));
      this.summary = await firstValueFrom(this.api.get<ReportSummaryDto>('/reports/monthly', params));
      const transactions = this.data.getTransactions().filter(tx =>
        tx.status === 'Completed' && !tx.reversed && tx.dateTime.slice(0, 7) === this.month,
      );
      const payments = this.data.getPayments().filter(payment => payment.dateTime.slice(0, 7) === this.month);
      this.paymentCount = payments.length;
      const daily = new Map<string, { entries: number; payments: number }>();
      for (const transaction of transactions) {
        const values = daily.get(transaction.dateTime.slice(0, 10)) ?? { entries: 0, payments: 0 };
        values.entries += transaction.total;
        daily.set(transaction.dateTime.slice(0, 10), values);
      }
      for (const payment of payments) {
        const values = daily.get(payment.dateTime.slice(0, 10)) ?? { entries: 0, payments: 0 };
        values.payments += payment.amount;
        daily.set(payment.dateTime.slice(0, 10), values);
      }
      this.days = [...daily.entries()].sort(([a], [b]) => a.localeCompare(b))
        .map(([date, values]) => ({ date, ...values }));
    } catch (error) {
      this.error = apiErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }
}
