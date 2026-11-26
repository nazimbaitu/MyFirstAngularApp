import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../core/models/customer.model';
@Component({selector:'app-customer-form-modal',standalone:true,imports:[FormsModule],template:`<div class="form-grid"><div class="form-group"><label>Name</label><input [(ngModel)]="customer.name" name="name"></div><div class="form-group"><label>Mobile</label><input [(ngModel)]="customer.mobile" name="mobile"></div></div>`})
export class CustomerFormModalComponent { @Input() customer!:Customer; }
