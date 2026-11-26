import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { Payment } from '../models/payment.model';
import { toPaisa, fromPaisa, todayISO } from '../utils/formatters';

export interface LedgerEntry {
  date: string; reference: string; description: string; debit: number; credit: number;
  type: 'opening'|'credit'|'payment'; runningBalance?: number; txnId?: string; payId?: string;
}

@Injectable({ providedIn: 'root' })
export class CalcService {
  private data = inject(DataService);
  customerBalance(customerId: string): number {
    const customer = this.data.getCustomers().find(c => c.id === customerId);
    if (!customer) return 0;
    let balance = toPaisa(customer.openingBalance);
    for (const tx of this.data.getTransactions()) if (tx.customerId === customerId && tx.status === 'Completed' && !tx.reversed) balance += toPaisa(tx.total);
    for (const pay of this.data.getPayments()) if (pay.customerId === customerId && pay.status === 'Completed') balance -= toPaisa(pay.amount);
    return fromPaisa(balance);
  }
  totalOutstanding(): number {
    return this.data.getCustomers().filter(c => c.status === 'Active').reduce((sum, c) => sum + toPaisa(this.customerBalance(c.id)), 0) / 100;
  }
  totalCustomers(): number { return this.data.getCustomers().length; }
  totalTransactions(): number { return this.data.getTransactions().filter(t => t.status === 'Completed' && !t.reversed).length; }
  todaysEntries(): Transaction[] { const today = todayISO(); return this.data.getTransactions().filter(t => t.dateTime.slice(0,10) === today); }
  todaysPayments(): Payment[] { const today = todayISO(); return this.data.getPayments().filter(p => p.dateTime.slice(0,10) === today); }
  todaysEntryTotal(): number { return this.todaysEntries().filter(t => t.status === 'Completed' && !t.reversed).reduce((sum,t) => sum + toPaisa(t.total), 0) / 100; }
  todaysPaymentTotal(): number { return this.todaysPayments().filter(p => p.status === 'Completed').reduce((sum,p) => sum + toPaisa(p.amount), 0) / 100; }
  customerLedger(customerId: string): { entries: LedgerEntry[], summary: { opening:number, totalDebit:number, totalCredit:number, current:number }, customer: Customer | undefined } {
    const customer = this.data.getCustomers().find(c => c.id === customerId);
    let running = toPaisa(customer?.openingBalance || 0);
    let totalDebit = 0, totalCredit = 0;
    const entries: LedgerEntry[] = [];
    if (customer) entries.push({ date: customer.createdDate, reference: 'OPEN', description: 'Opening Balance', debit: customer.openingBalance, credit: 0, type: 'opening', runningBalance: fromPaisa(running) });
    const events: Array<{date:string; entry:LedgerEntry}> = [];
    for (const tx of this.data.getTransactions()) {
      if (tx.customerId === customerId && tx.status === 'Completed' && !tx.reversed) events.push({ date:tx.dateTime, entry:{ date:tx.dateTime, reference:tx.reference, description:tx.items.map(i => i.desc).join(', ') || 'Khata entry', debit:tx.total, credit:0, type:'credit', txnId:tx.id }});
    }
    for (const pay of this.data.getPayments()) {
      if (pay.customerId === customerId && pay.status === 'Completed') events.push({ date:pay.dateTime, entry:{ date:pay.dateTime, reference:pay.reference, description:pay.method, debit:0, credit:pay.amount, type:'payment', payId:pay.id }});
    }
    events.sort((a,b) => a.date.localeCompare(b.date));
    for (const event of events) {
      const debitP = toPaisa(event.entry.debit), creditP = toPaisa(event.entry.credit);
      running += debitP - creditP; totalDebit += debitP; totalCredit += creditP;
      event.entry.runningBalance = fromPaisa(running);
      entries.push(event.entry);
    }
    return { entries, summary:{ opening:customer?.openingBalance || 0, totalDebit:fromPaisa(totalDebit), totalCredit:fromPaisa(totalCredit), current:fromPaisa(running) }, customer };
  }
  lastTxDate(customerId: string): string | null {
    const dates = [
      ...this.data.getTransactions().filter(t => t.customerId === customerId).map(t => t.dateTime),
      ...this.data.getPayments().filter(p => p.customerId === customerId).map(p => p.dateTime),
    ].sort();
    return dates.length ? dates[dates.length-1] : null;
  }
}
