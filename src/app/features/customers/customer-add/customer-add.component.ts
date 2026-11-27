import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiService } from '../../../core/services/api.service';
interface CustomerFormErrors {
  name?: string;
  mobile?: string;
  secondaryMobile?: string;
  additionalMobile?: string;
  openingBalance?: string;
  photo?: string;
}
@Component({selector:'app-customer-add',standalone:true,imports:[FormsModule],template:`
<div class="page-head"><div><h1>Add Customer</h1></div><button class="btn btn-outline" (click)="cancel()">Cancel</button></div>
<div class="card"><form (ngSubmit)="save()"><div class="form-grid"><div class="form-group"><label>Full Name *</label><input [(ngModel)]="name" name="name"><div class="field-error">{{errors.name}}</div></div><div class="form-group"><label>Primary Mobile *</label><input [(ngModel)]="mobile" name="mobile" required><div class="field-error">{{errors.mobile}}</div></div><div class="form-group"><label>Secondary Mobile</label><input [(ngModel)]="secondaryMobile" name="secondaryMobile" maxlength="20"><div class="field-error">{{errors.secondaryMobile}}</div></div><div class="form-group"><label>Additional Mobile</label><input [(ngModel)]="additionalMobile" name="additionalMobile" maxlength="20"><div class="field-error">{{errors.additionalMobile}}</div></div><div class="form-group full"><label>Customer Photo</label><input type="file" accept=".jpg,.jpeg,.png,.webp" (change)="selectPhoto($event)"><div class="field-error">{{errors.photo}}</div>@if(photoPreview){<img [src]="photoPreview" alt="Customer photo preview" style="display:block;width:80px;height:80px;object-fit:cover;border-radius:50%;margin-top:8px">}</div><div class="form-group full"><label>Address</label><input [(ngModel)]="address" name="address"></div><div class="form-group"><label>Opening Balance</label><input type="number" min="0" [(ngModel)]="openingBalance" name="openingBalance"><div class="field-error">{{errors.openingBalance}}</div></div><div class="form-group"><label>Status</label><select [(ngModel)]="status" name="status"><option>Active</option><option>Inactive</option></select></div><div class="form-group full"><label>Notes</label><textarea [(ngModel)]="notes" name="notes"></textarea></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Save Customer</button><button class="btn btn-outline" type="button" (click)="cancel()">Cancel</button></div></form></div>`})
export class CustomerAddComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private router=inject(Router);private notifications=inject(NotificationService);private toast=inject(ToastService);private api=inject(ApiService);
  name='';mobile='';secondaryMobile='';additionalMobile='';address='';openingBalance=0;status:'Active'|'Inactive'='Active';notes='';errors:CustomerFormErrors={};selectedPhoto:File|null=null;photoPreview='';
  ngOnInit(){this.layout.setTitle('Add Customer');}
  selectPhoto(event:Event){this.errors.photo='';const input=event.target as HTMLInputElement;const file=input.files?.[0]??null;this.selectedPhoto=file;if(!file){this.photoPreview='';return;}const extension=file.name.split('.').pop()?.toLowerCase();if(file.size>2*1024*1024||!['jpg','jpeg','png','webp'].includes(extension||'')){this.errors.photo='Choose a JPG, JPEG, PNG, or WEBP image no larger than 2 MB.';this.selectedPhoto=null;this.photoPreview='';input.value='';return;}const reader=new FileReader();reader.onload=()=>this.photoPreview=String(reader.result||'');reader.readAsDataURL(file);}
  async save(){this.errors={};if(!this.name.trim())this.errors.name='Full name is required';if(!/^[0-9+\-\s]{7,15}$/.test(this.mobile))this.errors.mobile='Enter a valid mobile number';if(!this.errors.mobile){const dup=this.data.getCustomers().find(c=>c.mobile===this.mobile.trim());if(dup)this.errors.mobile=`This mobile number is already registered (${dup.name}).`;}if(this.secondaryMobile.length>20)this.errors.secondaryMobile='Use 20 characters or fewer';if(this.additionalMobile.length>20)this.errors.additionalMobile='Use 20 characters or fewer';if(Number(this.openingBalance)<0)this.errors.openingBalance='Opening balance cannot be negative';if(Object.keys(this.errors).length)return;
    try {
      const saved=await this.api.post<any>('/customers',{name:this.name.trim(),mobile:this.mobile.trim(),secondaryMobile:this.secondaryMobile.trim()||null,additionalMobile:this.additionalMobile.trim()||null,address:this.address.trim(),openingBalance:Number(this.openingBalance),notes:this.notes.trim()});
      const customer={id:saved.id,name:saved.name,mobile:saved.mobile,secondaryMobile:saved.secondaryMobile,additionalMobile:saved.additionalMobile,photoUrl:saved.photoUrl,address:saved.address,openingBalance:saved.openingBalance,notes:saved.notes,createdDate:saved.createdAtUtc,status:(saved.status===1?'Inactive':'Active') as 'Active'|'Inactive'};
      if(this.selectedPhoto){const form=new FormData();form.append('file',this.selectedPhoto);try{const result=await this.api.post<{photoUrl:string}>(`/customers/${encodeURIComponent(customer.id)}/photo`,form);customer.photoUrl=result.photoUrl;}catch(error:any){const list=this.data.getCustomers();list.push(customer);this.data.saveCustomers(list);this.notifications.add('info','Customer Added',`Customer ${customer.name} was added.`);this.toast.show('Photo Upload Failed','Customer was saved, but the photo could not be uploaded. '+(error?.message||''),'error');this.router.navigate(['/customers']);return;}}
      const list=this.data.getCustomers();list.push(customer);this.data.saveCustomers(list);this.notifications.add('info','Customer Added',`Customer ${customer.name} was added.`);this.toast.show('Customer Saved','Customer saved to the database','success');this.router.navigate(['/customers']);
    } catch (error:any) {this.toast.show('Save Failed',error?.message||'Could not save customer','error');}
  }
  cancel(){this.router.navigate(['/customers']);}
}
