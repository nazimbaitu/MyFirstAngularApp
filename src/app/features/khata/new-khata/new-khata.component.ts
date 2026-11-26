import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { CalcService } from '../../../core/services/calc.service';
import { ModalService } from '../../../core/services/modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { PrintService } from '../../../core/services/print.service';
import { Customer } from '../../../core/models/customer.model';
import { KhataItem, Transaction } from '../../../core/models/transaction.model';
import { fmtAmount, nowISO, esc, toPaisa, fromPaisa } from '../../../core/utils/formatters';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { CreateTransactionRequest, TransactionDto } from '../../../core/models/api.models';
import { firstValueFrom } from 'rxjs';
@Component({selector:'app-new-khata',standalone:true,imports:[FormsModule,CommonModule],template:`
<div class="page-head"><h1>New Khata Entry</h1></div><div class="khata-layout"><div>
<div class="card"><div class="form-grid"><div class="form-group"><label>Customer *</label><select [(ngModel)]="customerId" name="customer"><option value="">Select customer</option>@for(c of customers;track c.id){<option [value]="c.id">{{c.name}} - {{c.mobile}}</option>}</select><div class="field-error">{{errors.customer}}</div></div><div class="form-group"><label>Notes</label><textarea [(ngModel)]="notes" name="notes"></textarea></div></div></div>
<div class="card"><table class="data-table items-table"><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th></th></tr></thead><tbody>@for(item of items;track $index){<tr><td>{{$index+1}}</td><td><input [(ngModel)]="item.desc" [name]="'desc'+$index" placeholder="Item"></td><td><input type="number" min="0.01" [(ngModel)]="item.qty" [name]="'qty'+$index" (ngModelChange)="recalc(item)"></td><td><input type="number" min="0" [(ngModel)]="item.price" [name]="'price'+$index" (ngModelChange)="recalc(item)"></td><td class="amount">{{lineTotal(item)|number:'1.2-2'}}</td><td><button class="btn btn-xs btn-danger" type="button" (click)="removeItem($index)" [disabled]="items.length===1"><i class="fas fa-trash"></i></button></td></tr>}</tbody></table><button class="btn btn-outline btn-sm" type="button" (click)="addItem()"><i class="fas fa-plus"></i> Add Item</button><div class="field-error">{{errors.items}}</div></div></div>
<aside><div class="card khata-summary"><h3>Customer Info</h3><b>{{selectedCustomer()?.name||'No customer selected'}}</b><p class="text-muted">Current Balance: <strong class="text-red">{{customerBalanceText()}}</strong></p></div><div class="card grand-total-box"><span>Grand Total</span><strong>{{grandTotal()|number:'1.2-2'}}</strong><button class="btn btn-primary" type="button" (click)="save()">Save Khata Entry</button></div></aside></div>`})
export class NewKhataComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);calc=inject(CalcService);private modal=inject(ModalService);private toast=inject(ToastService);private print=inject(PrintService);private router=inject(Router);private api=inject(ApiService);
  customers:Customer[]=[];customerId='';notes='';items:KhataItem[]=[{desc:'',qty:1,price:0,total:0}];errors:any={};
  ngOnInit(){this.layout.setTitle('New Khata Entry');this.customers=this.data.getCustomers().filter(c=>c.status==='Active').sort((a,b)=>a.name.localeCompare(b.name));}
  selectedCustomer():Customer|undefined{return this.customers.find(c=>c.id===this.customerId);}
  customerBalanceText():string { const c=this.selectedCustomer(); return c ? fmtAmount(this.calc.customerBalance(c.id)) : fmtAmount(0); }
  currencyFormat(v:number):string{return fmtAmount(v);}
  recalc(item:KhataItem){item.total=fromPaisa(toPaisa(item.qty)*toPaisa(item.price)/100);}
  lineTotal(item:KhataItem){return fromPaisa(toPaisa(item.qty)*toPaisa(item.price)/100);}
  grandTotal():number{return this.items.reduce((sum,i)=>sum+toPaisa(i.qty)*toPaisa(i.price)/100,0)/100;}
  addItem(){this.items.push({desc:'',qty:1,price:0,total:0});}removeItem(i:number){if(this.items.length>1)this.items.splice(i,1);}
  save(){this.errors={};const c=this.selectedCustomer();if(!c)this.errors.customer='Customer is required';if(!this.items.some(i=>i.desc.trim())||this.items.some(i=>!i.desc.trim()||i.qty<=0||i.price<0))this.errors.items='Enter valid item, quantity and price for every row';const totalP=this.items.reduce((sum,i)=>sum+toPaisa(i.qty)*toPaisa(i.price)/100,0);if(totalP<=0)this.errors.items='Grand total must be greater than zero';if(Object.keys(this.errors).length)return;
    this.modal.confirm('Confirm Khata Entry',`Add khata entry of ${fmtAmount(fromPaisa(totalP))} for ${c!.name}?`,()=>this.commit(c!,totalP));
  }
  async commit(c:Customer,totalP:number){
    try {
    const request:CreateTransactionRequest={customerId:c.id,dateTimeUtc:nowISO(),items:this.items.map(i=>({description:i.desc.trim(),quantity:i.qty,unitPrice:i.price,total:fromPaisa(toPaisa(i.qty)*toPaisa(i.price)/100)})),notes:this.notes.trim()||null};
    const saved=await firstValueFrom(this.api.post<TransactionDto>('/transactions',request));
    const tx:Transaction={id:saved.id,reference:saved.reference,customerId:saved.customerId,dateTime:saved.dateTimeUtc,items:saved.items.map(i=>({desc:i.description,qty:i.quantity,price:i.unitPrice,total:i.total})),total:saved.total,notes:saved.notes??undefined,createdBy:saved.createdBy,status:saved.status===1||String(saved.status).toLowerCase()==='cancelled'?'Cancelled':'Completed',reversed:saved.reversed};
    await firstValueFrom(this.data.reloadTransactions());
    await firstValueFrom(this.data.reloadNotifications());
    this.toast.show('Khata Saved','Transaction saved to the database.','success');
    this.modal.open({title:'Khata Entry Saved',body:`<div class="success-panel"><i class="fas fa-circle-check sp-icon"></i><h3>${esc(tx.reference)} saved</h3><p>${fmtAmount(tx.total)}</p></div>`,buttons:[{label:'View Transaction',className:'btn-outline',close:true,onClick:()=>this.router.navigate(['/transactions'])},{label:'Customer Ledger',className:'btn-primary',close:true,onClick:()=>this.router.navigate(['/ledger'],{queryParams:{customer:c.id}})},{label:'Print Receipt',className:'btn-navy',close:true,onClick:()=>this.print.printKhataReceipt(tx.id)}]});
    this.items=[{desc:'',qty:1,price:0,total:0}];this.notes='';this.customerId='';
    } catch (error:any) {
      this.toast.show('Save Failed',apiErrorMessage(error),'error');
    }
  }
}
