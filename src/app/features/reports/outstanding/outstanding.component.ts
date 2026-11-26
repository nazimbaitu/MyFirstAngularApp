import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { OutstandingDto } from '../../../core/models/api.models';
import { fmtDate } from '../../../core/utils/formatters';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-outstanding',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyFormatPipe, EmptyStateComponent],
  template: `
    <div class="page-head"><h1>Outstanding Balances</h1><button class="btn btn-navy" (click)="print()" [disabled]="!filtered.length"><i class="fas fa-print"></i> Export / Print</button></div>
    <div class="card toolbar"><div class="search-input-wrap"><i class="fas fa-search"></i><input [(ngModel)]="search" (ngModelChange)="apply()" placeholder="Search customer"></div></div>
    @if (loading) { <p role="status">Loading outstanding balances…</p> }
    @if (error) { <p class="field-error" role="alert">{{error}}</p> }
    @if (!loading && !error) {
      @if (filtered.length) {
        <div class="card table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Customer</th><th>Mobile</th><th>Balance</th><th>Action</th></tr></thead><tbody>
          @for(c of filtered;track c.customerId;let i=$index){<tr><td>{{i+1}}</td><td>{{c.customerName}}</td><td>{{c.mobile}}</td><td class="amount text-red">{{c.balance|currencyFormat}}</td><td><a class="btn btn-xs btn-outline" [routerLink]="['/ledger']" [queryParams]="{customer:c.customerId}">Ledger</a></td></tr>}
          <tr><td colspan="3"><b>Total</b></td><td class="amount text-red"><b>{{total|currencyFormat}}</b></td><td></td></tr>
        </tbody></table></div>
      } @else {
        <app-empty-state icon="fa-circle-check" title="No outstanding balances" message="No customers currently have an outstanding balance."></app-empty-state>
      }
    }
  `,
})
export class OutstandingComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly api = inject(ApiService);
  search = '';
  private records: OutstandingDto[] = [];
  filtered: OutstandingDto[] = [];
  total = 0;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.layout.setTitle('Outstanding Balances');
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.records = await firstValueFrom(this.api.get<OutstandingDto[]>('/reports/outstanding'));
      this.apply();
    } catch (error) {
      this.error = apiErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  apply(): void {
    const query = this.search.trim().toLowerCase();
    this.filtered = this.records.filter(item => item.balance > 0 &&
      (!query || item.customerName.toLowerCase().includes(query) || item.mobile.toLowerCase().includes(query)),
    ).sort((a, b) => b.balance - a.balance);
    this.total = this.filtered.reduce((sum, item) => sum + item.balance, 0);
  }

  print(): void { window.print(); }
}
