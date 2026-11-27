import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../core/models/customer.model';
@Component({selector:'app-customer-form-modal',standalone:true,imports:[FormsModule],template:`<div class="form-grid"><div class="form-group"><label>Name</label><input [(ngModel)]="customer.name" name="name"></div><div class="form-group"><label>Primary Mobile *</label><input [(ngModel)]="customer.mobile" name="mobile" required></div><div class="form-group"><label>Secondary Mobile</label><input [(ngModel)]="customer.secondaryMobile" name="secondaryMobile" maxlength="20"></div><div class="form-group"><label>Additional Mobile</label><input [(ngModel)]="customer.additionalMobile" name="additionalMobile" maxlength="20"></div><div class="form-group full"><label>Change Photo</label><input type="file" accept=".jpg,.jpeg,.png,.webp" (change)="selectPhoto($event)"><div class="field-error">{{photoError}}</div>@if(photoPreview){<img [src]="photoPreview" alt="Customer photo preview" style="display:block;width:80px;height:80px;object-fit:cover;border-radius:50%;margin-top:8px">}@else if(customer.photoUrl){<img [src]="photoUrl" alt="Customer photo" style="display:block;width:80px;height:80px;object-fit:cover;border-radius:50%;margin-top:8px">}</div></div>`})
export class CustomerFormModalComponent {
  @Input() customer!:Customer;
  selectedPhoto:File|null=null;
  photoPreview='';
  photoError='';
  get photoUrl():string{return this.customer.photoUrl||'';}
  selectPhoto(event:Event):void{const input=event.target as HTMLInputElement;const file=input.files?.[0]??null;this.photoError='';if(!file){this.selectedPhoto=null;this.photoPreview='';return;}const extension=file.name.split('.').pop()?.toLowerCase();if(file.size>2*1024*1024||!['jpg','jpeg','png','webp'].includes(extension||'')){this.photoError='Choose a JPG, JPEG, PNG, or WEBP image no larger than 2 MB.';input.value='';this.selectedPhoto=null;this.photoPreview='';return;}this.selectedPhoto=file;const reader=new FileReader();reader.onload=()=>this.photoPreview=String(reader.result||'');reader.readAsDataURL(file);}
}
