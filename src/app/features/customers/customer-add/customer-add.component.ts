import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { uid, nowISO } from '../../../core/utils/formatters';
import { ApiService } from '../../../core/services/api.service';
@Component({selector:'app-customer-add',standalone:true,imports:[FormsModule],template:`
<div class="page-head"><div><h1>Add Customer</h1></div><button class="btn btn-outline" (click)="cancel()">Cancel</button></div>
<div class="card"><form (ngSubmit)="save()"><div class="form-grid"><div class="form-group"><label>Full Name *</label><input [(ngModel)]="name" name="name"><div class="field-error">{{errors.name}}</div></div><div class="form-group"><label>Mobile *</label><input [(ngModel)]="mobile" name="mobile"><div class="field-error">{{errors.mobile}}</div></div><div class="form-group full"><label>Address</label><input [(ngModel)]="address" name="address"></div><div class="form-group"><label>Opening Balance</label><input type="number" min="0" [(ngModel)]="openingBalance" name="openingBalance"><div class="field-error">{{errors.openingBalance}}</div></div><div class="form-group"><label>Status</label><select [(ngModel)]="status" name="status"><option>Active</option><option>Inactive</option></select></div><div class="form-group full"><label>Notes</label><textarea [(ngModel)]="notes" name="notes"></textarea></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Save Customer</button><button class="btn btn-outline" type="button" (click)="cancel()">Cancel</button></div></form></div>`})
export class CustomerAddComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private router=inject(Router);private notifications=inject(NotificationService);private toast=inject(ToastService);private api=inject(ApiService);
  name='';mobile='';address='';openingBalance=0;status:'Active'|'Inactive'='Active';notes='';errors:any={};
  ngOnInit(){this.layout.setTitle('Add Customer');}
  async save(){this.errors={};if(!this.name.trim())this.errors.name='Full name is required';if(!/^[0-9+\-\s]{7,15}$/.test(this.mobile))this.errors.mobile='Enter a valid mobile number';if(!this.errors.mobile){const dup=this.data.getCustomers().find(c=>c.mobile===this.mobile);if(dup)this.errors.mobile=`This mobile number is already registered (${dup.name}).`;}if(Number(this.openingBalance)<0)this.errors.openingBalance='Opening balance cannot be negative';if(Object.keys(this.errors).length)return;
    try {
      const saved=await this.api.post<any>('/customers',{name:this.name.trim(),mobile:this.mobile.trim(),address:this.address.trim(),openingBalance:Number(this.openingBalance),notes:this.notes.trim()});
      const list=this.data.getCustomers();const customer={id:saved.id,name:saved.name,mobile:saved.mobile,address:saved.address,openingBalance:saved.openingBalance,notes:saved.notes,createdDate:saved.createdAtUtc,status:(saved.status===1?'Inactive':'Active') as 'Active'|'Inactive'};list.push(customer);this.data.saveCustomers(list);this.notifications.add('info','Customer Added',`Customer ${customer.name} was added.`);this.toast.show('Customer Saved','Customer saved to the database','success');this.router.navigate(['/customers']);
    } catch (error:any) {this.toast.show('Save Failed',error?.message||'Could not save customer','error');}
  }
  cancel(){this.router.navigate(['/customers']);}
}
