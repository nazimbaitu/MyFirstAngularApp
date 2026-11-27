import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { PrintService } from '../../../core/services/print.service';
import { Customer } from '../../../core/models/customer.model';
import { KhataItem, Transaction } from '../../../core/models/transaction.model';
import { fmtAmount, nowISO, esc, toPaisa, fromPaisa } from '../../../core/utils/formatters';
import { ApiService } from '../../../core/services/api.service';
import { CustomerSearchSelectComponent } from '../../../shared/components/customer-search-select/customer-search-select.component';
@Component({selector:'app-new-khata',standalone:true,imports:[FormsModule,CommonModule,CustomerSearchSelectComponent],template:`
<div class="page-head"><h1>New Khata Entry</h1></div>
<div class="khata-layout">
  <div>
    <div class="card">
      <div class="form-grid">
        <div class="form-group">
          <label>Customer *</label>
          <app-customer-search-select [customers]="customers" [selectedCustomerId]="customerId"
            (selectedCustomerIdChange)="customerId = $event"></app-customer-search-select>
          <select [(ngModel)]="customerId" name="customer" aria-label="Select customer">
            <option value="">Select customer</option>
            @for(c of customers;track c.id){<option [value]="c.id">{{c.name}} - {{c.mobile}}</option>}
          </select>
          <div class="field-error">{{errors.customer}}</div>
        </div>
        <div class="form-group"><label>Notes</label><textarea [(ngModel)]="notes" name="notes"></textarea></div>
      </div>
    </div>
    <div class="card">
      <table class="data-table items-table">
        <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th></th></tr></thead>
        <tbody>
          @for(item of items;track $index){
            <tr>
              <td>{{$index+1}}</td>
              <td><input [(ngModel)]="item.desc" [name]="'desc'+$index" placeholder="Item"></td>
              <td><input type="number" min="0.01" [(ngModel)]="item.qty" [name]="'qty'+$index" (ngModelChange)="recalc(item)"></td>
              <td><input type="number" min="0" [(ngModel)]="item.price" [name]="'price'+$index" (ngModelChange)="recalc(item)"></td>
              <td class="amount">{{lineTotal(item)|number:'1.2-2'}}</td>
              <td><button class="btn btn-xs btn-danger" type="button" (click)="removeItem($index)" [disabled]="items.length===1"><i class="fas fa-trash"></i></button></td>
            </tr>
          }
        </tbody>
      </table>
      <button class="btn btn-outline btn-sm" type="button" (click)="addItem()"><i class="fas fa-plus"></i> Add Item</button>
      <div class="field-error">{{errors.items}}</div>
    </div>
    <div class="khata-form-actions">
      <button class="btn btn-outline" type="button" (click)="clear()">Clear</button>
      <button class="btn btn-primary" type="button" (click)="save('save')" [disabled]="isSaving">Save</button>
      <button class="btn btn-green" type="button" (click)="save('print')" [disabled]="isSaving"><i class="fas fa-print"></i> Print</button>
    </div>
  </div>
  <aside class="card khata-slip-preview">
    <div class="khata-slip-heading">
      <h2>{{settings.shopName}}</h2>
      @if(settings.address){<p>{{settings.address}}</p>}
      @if(settings.mobile){<p>{{settings.mobile}}</p>}
    </div>
    <hr>
    <h3>Khata Slip Preview</h3>
    <p><strong>Date:</strong> {{today|date:'mediumDate'}}</p>
    <p><strong>Customer:</strong> {{selectedCustomer()?.name||'Not selected'}}</p>
    @if(selectedCustomer(); as customer){<p><strong>Mobile:</strong> {{customer.mobile}}</p>}
    <table class="khata-slip-items">
      <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
      <tbody>
        @for(item of items;track $index){
          @if(item.desc.trim()){<tr><td>{{item.desc}}</td><td>{{item.qty}}</td><td class="amount">{{lineTotal(item)|number:'1.2-2'}}</td></tr>}
        }
      </tbody>
    </table>
    <div class="khata-slip-total"><span>Grand Total</span><strong>{{grandTotal()|number:'1.2-2'}}</strong></div>
    <small class="text-muted">Reference is assigned when saved.</small>
  </aside>
</div>`})
export class NewKhataComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private modal=inject(ModalService);private notifications=inject(NotificationService);private toast=inject(ToastService);private print=inject(PrintService);private router=inject(Router);private api=inject(ApiService);
  customers:Customer[]=[];customerId='';notes='';items:KhataItem[]=[{desc:'',qty:1,price:0,total:0}];errors:{customer?:string;items?:string}={};isSaving=false;today=new Date();
  get settings(){return this.data.getSettings();}
  ngOnInit(){this.layout.setTitle('New Khata Entry');this.customers=this.data.getCustomers().filter(c=>c.status==='Active').sort((a,b)=>a.name.localeCompare(b.name));}
  selectedCustomer():Customer|undefined{return this.customers.find(c=>c.id===this.customerId);}
  recalc(item:KhataItem){item.total=fromPaisa(toPaisa(item.qty)*toPaisa(item.price)/100);}
  lineTotal(item:KhataItem){return fromPaisa(toPaisa(item.qty)*toPaisa(item.price)/100);}
  grandTotal():number{return this.items.reduce((sum,i)=>sum+toPaisa(i.qty)*toPaisa(i.price)/100,0)/100;}
  addItem(){this.items.push({desc:'',qty:1,price:0,total:0});}removeItem(i:number){if(this.items.length>1)this.items.splice(i,1);}
  save(mode:'save'|'print'='save'){this.errors={};const c=this.selectedCustomer();if(!c)this.errors.customer='Customer is required';if(!this.items.some(i=>i.desc.trim())||this.items.some(i=>!i.desc.trim()||i.qty<=0||i.price<0))this.errors.items='Enter valid item, quantity and price for every row';const totalP=this.items.reduce((sum,i)=>sum+toPaisa(i.qty)*toPaisa(i.price)/100,0);if(totalP<=0)this.errors.items='Grand total must be greater than zero';if(Object.keys(this.errors).length||this.isSaving)return;
    this.modal.confirm('Confirm Khata Entry',`Add khata entry of ${fmtAmount(fromPaisa(totalP))} for ${c!.name}?`,()=>this.commit(c!,totalP,mode));
  }
  async commit(c:Customer,totalP:number,mode:'save'|'print'='save'){
    if(this.isSaving)return;
    this.isSaving=true;
    try {
    const saved=await this.api.post<any>('/transactions',{customerId:c.id,dateTimeUtc:nowISO(),items:this.items.map(i=>({description:i.desc.trim(),quantity:i.qty,unitPrice:i.price,total:fromPaisa(toPaisa(i.qty)*toPaisa(i.price)/100)})),notes:this.notes.trim()||null});
    const tx:Transaction={id:saved.id,reference:saved.reference,customerId:saved.customerId,dateTime:saved.dateTimeUtc,items:saved.items.map((i:any)=>({desc:i.description,qty:i.quantity,price:i.unitPrice,total:i.total})),total:saved.total,notes:saved.notes,createdBy:saved.createdBy,status:saved.status,reversed:saved.reversed};
    const txns=this.data.getTransactions();txns.push(tx);this.data.saveTransactions(txns);this.notifications.add('credit','New Khata Entry',`Khata entry of ${fmtAmount(tx.total)} recorded for ${c.name}.`);this.toast.show('Khata Saved','Transaction saved to the database','success');
    if(mode==='print')this.print.printKhataReceipt(tx.id);
    this.modal.open({title:'Khata Entry Saved',body:`<div class="success-panel"><i class="fas fa-circle-check sp-icon"></i><h3>${esc(tx.reference)} saved</h3><p>${fmtAmount(tx.total)}</p></div>`,buttons:[{label:'View Transaction',className:'btn-outline',close:true,onClick:()=>this.router.navigate(['/transactions'])},{label:'Customer Ledger',className:'btn-primary',close:true,onClick:()=>this.router.navigate(['/ledger'],{queryParams:{customer:c.id}})},{label:'New Entry',className:'btn-outline',close:true}]});
    this.clear();
    } catch (error:any) {
      this.toast.show('Save Failed',error?.message||'Could not save transaction','error');
    } finally {
      this.isSaving=false;
    }
  }
  clear():void{this.items=[{desc:'',qty:1,price:0,total:0}];this.notes='';this.customerId='';this.errors={};}
}
