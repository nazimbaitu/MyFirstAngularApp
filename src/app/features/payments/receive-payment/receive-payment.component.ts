import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { CalcService } from '../../../core/services/calc.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { PrintService } from '../../../core/services/print.service';
import { Customer } from '../../../core/models/customer.model';
import { Payment } from '../../../core/models/payment.model';
import { fmtAmount, uid, nowISO, todayISO, esc, toPaisa, fromPaisa } from '../../../core/utils/formatters';
@Component({selector:'app-receive-payment',standalone:true,imports:[FormsModule],template:`
<div class="page-head"><h1>Receive Payment</h1></div><div class="card"><form (ngSubmit)="save()"><div class="form-grid"><div class="form-group"><label>Customer *</label><select [(ngModel)]="customerId" name="customer" (change)="updateBalance()"><option value="">Select customer</option>@for(c of customers;track c.id){<option [value]="c.id">{{c.name}}</option>}</select><div class="field-error">{{errors.customer}}</div></div><div class="form-group"><label>Current Outstanding</label><input [value]="outstandingText()" readonly></div><div class="form-group"><label>Payment Amount *</label><input type="number" min="0.01" [(ngModel)]="amount" name="amount"><div class="field-error">{{errors.amount}}</div></div><div class="form-group"><label>Payment Date</label><input type="date" [(ngModel)]="date" name="date"></div><div class="form-group"><label>Payment Method</label><select [(ngModel)]="method" name="method"><option>Cash</option><option>Bank Transfer</option><option>EasyPaisa</option><option>JazzCash</option><option>Other</option></select></div><div class="form-group"><label>Reference Number</label><input [(ngModel)]="refNumber" name="refNumber"></div><div class="form-group full"><label>Notes</label><textarea [(ngModel)]="notes" name="notes"></textarea></div></div><div class="form-actions"><button class="btn btn-green" type="submit">Record Payment</button><button class="btn btn-outline" type="button" (click)="cancel()">Cancel</button></div></form></div>`})
export class ReceivePaymentComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private calc=inject(CalcService);private modal=inject(ModalService);private notifications=inject(NotificationService);private toast=inject(ToastService);private print=inject(PrintService);private router=inject(Router);
  customers:Customer[]=[];customerId='';amount:number|null=null;date=todayISO();method='Cash';refNumber='';notes='';errors:any={};
  ngOnInit(){this.layout.setTitle('Receive Payment');this.customers=this.data.getCustomers().filter(c=>c.status==='Active').sort((a,b)=>a.name.localeCompare(b.name));}
  updateBalance():void{}
  outstandingText():string{const c=this.selectedCustomer();return c?fmtAmount(this.calc.customerBalance(c.id)):'PKR 0.00';}
  selectedCustomer():Customer|undefined{return this.customers.find(c=>c.id===this.customerId);}
  save(){this.errors={};const c=this.selectedCustomer();if(!c)this.errors.customer='Customer is required';const amount=Number(this.amount||0);if(amount<=0)this.errors.amount='Payment amount must be greater than zero';if(c&&amount>this.calc.customerBalance(c.id))this.errors.amount=`Amount exceeds outstanding balance (${fmtAmount(this.calc.customerBalance(c.id))}).`;if(Object.keys(this.errors).length)return;this.modal.confirm('Confirm Payment',`Record payment of ${fmtAmount(amount)} from ${c!.name}?`,()=>this.commit(c!,amount));}
  commit(c:Customer,amount:number){const list=this.data.getPayments();const pay:Payment={id:uid('PAY'),reference:`SK-PY-${String(list.length+1).padStart(3,'0')}`,customerId:c.id,amount:fromPaisa(toPaisa(amount)),dateTime:new Date(`${this.date}T${new Date().toTimeString().slice(0,8)}`).toISOString(),method:this.method,refNumber:this.refNumber.trim()||undefined,notes:this.notes.trim()||undefined,createdBy:this.data.getProfile().name,status:'Completed'};list.push(pay);this.data.savePayments(list);this.notifications.add('payment','Payment Received',`Payment of ${fmtAmount(pay.amount)} received from ${c.name}.`);this.toast.show('Payment Received','Payment recorded successfully','success');
  this.modal.open({title:'Payment Recorded',body:`<div class="success-panel"><i class="fas fa-circle-check sp-icon"></i><h3>${esc(pay.reference)}</h3><p>${fmtAmount(pay.amount)}</p></div>`,buttons:[{label:'Print Receipt',className:'btn-navy',close:true,onClick:()=>this.print.printPaymentReceipt(pay.id)},{label:'View Ledger',className:'btn-primary',close:true,onClick:()=>this.router.navigate(['/ledger'],{queryParams:{customer:c.id}})}]});this.amount=null;this.refNumber='';this.notes='';}
  cancel(){this.router.navigate(['/payments/history']);}
}
