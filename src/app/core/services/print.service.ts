import { Injectable, inject } from '@angular/core';
import { DataService } from './data.service';
import { fmtAmount, fmtDateTime, esc } from '../utils/formatters';
@Injectable({ providedIn: 'root' })
export class PrintService {
  private data=inject(DataService);
  private write(html:string):void {
    const area=document.getElementById('printArea');
    if (area) { area.innerHTML=html; window.print(); setTimeout(()=>area.innerHTML='',500); }
  }
  printKhataReceipt(txnId:string):void {
    const tx=this.data.getTransactions().find(t=>t.id===txnId); if(!tx)return;
    const customer=this.data.getCustomers().find(c=>c.id===tx.customerId);
    const s=this.data.getSettings();
    const rows=tx.items.map(i=>`<tr><td>${esc(i.desc)}</td><td>${i.qty}</td><td>${fmtAmount(i.price)}</td><td>${fmtAmount(i.total)}</td></tr>`).join('');
    this.write(`<div class="receipt"><h2>${esc(s.shopName)}</h2>${s.showAddress?`<p>${esc(s.address)}</p>`:''}${s.showMobile?`<p>${esc(s.mobile)}</p>`:''}<hr><p><b>Khata Receipt</b></p><p>Ref: ${esc(tx.reference)}<br>Date: ${esc(fmtDateTime(tx.dateTime))}<br>Customer: ${esc(customer?.name||'')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><h3>Grand Total: ${fmtAmount(tx.total)}</h3>${s.showFooter?`<p>${esc(s.receiptFooter)}</p>`:''}</div>`);
  }
  printPaymentReceipt(payId:string):void {
    const pay=this.data.getPayments().find(p=>p.id===payId); if(!pay)return;
    const customer=this.data.getCustomers().find(c=>c.id===pay.customerId);
    const s=this.data.getSettings();
    this.write(`<div class="receipt"><h2>${esc(s.shopName)}</h2>${s.showAddress?`<p>${esc(s.address)}</p>`:''}${s.showMobile?`<p>${esc(s.mobile)}</p>`:''}<hr><p><b>Payment Receipt</b></p><p>Ref: ${esc(pay.reference)}<br>Date: ${esc(fmtDateTime(pay.dateTime))}<br>Customer: ${esc(customer?.name||'')}<br>Method: ${esc(pay.method)}<br>Amount: <b>${fmtAmount(pay.amount)}</b></p>${s.showFooter?`<p>${esc(s.receiptFooter)}</p>`:''}</div>`);
  }
  printLedger(customerId:string):void {
    const customer=this.data.getCustomers().find(c=>c.id===customerId); if(!customer)return;
    const s=this.data.getSettings();
    const transactions=this.data.getTransactions().filter(t=>t.customerId===customerId&&t.status==='Completed'&&!t.reversed);
    const payments=this.data.getPayments().filter(p=>p.customerId===customerId&&p.status==='Completed');
    const rows=[...transactions.map(t=>({date:t.dateTime,ref:t.reference,desc:t.items.map(i=>i.desc).join(', '),debit:t.total,credit:0})),...payments.map(p=>({date:p.dateTime,ref:p.reference,desc:p.method,debit:0,credit:p.amount}))].sort((a,b)=>a.date.localeCompare(b.date)).map(v=>`<tr><td>${esc(fmtDateTime(v.date))}</td><td>${esc(v.ref)}</td><td>${esc(v.desc)}</td><td>${fmtAmount(v.debit)}</td><td>${fmtAmount(v.credit)}</td></tr>`).join('');
    this.write(`<div class="receipt"><h2>${esc(s.shopName)}</h2>${s.showAddress?`<p>${esc(s.address)}</p>`:''}${s.showMobile?`<p>${esc(s.mobile)}</p>`:''}<h3>${esc(customer.name)} - Ledger</h3><table><thead><tr><th>Date</th><th>Ref</th><th>Description</th><th>Debit</th><th>Credit</th></tr></thead><tbody>${rows}</tbody></table>${s.showFooter?`<p>${esc(s.receiptFooter)}</p>`:''}</div>`);
  }
}
