import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../../../core/models/employee.model';
import { uid, nowISO } from '../../../core/utils/formatters';
@Component({selector:'app-employee-add',standalone:true,imports:[FormsModule],template:`<div class="page-head"><h1>Add Employee</h1></div><div class="card"><form (ngSubmit)="save()"><div class="form-grid"><div class="form-group"><label>Full Name *</label><input [(ngModel)]="name" name="name"><div class="field-error">{{errors.name}}</div></div><div class="form-group"><label>Username *</label><input [(ngModel)]="username" name="username"><div class="field-error">{{errors.username}}</div></div><div class="form-group"><label>Mobile</label><input [(ngModel)]="mobile" name="mobile"></div><div class="form-group"><label>Role</label><select [(ngModel)]="role" name="role"><option>Owner / Admin</option><option>Employee / Cashier</option></select></div><div class="form-group"><label>Status</label><select [(ngModel)]="status" name="status"><option>Active</option><option>Inactive</option></select></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Save Employee</button><button class="btn btn-outline" type="button" (click)="cancel()">Cancel</button></div></form></div>`})
export class EmployeeAddComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private router=inject(Router);private notifications=inject(NotificationService);private toast=inject(ToastService);
  name='';username='';mobile='';role:'Owner / Admin'|'Employee / Cashier'='Employee / Cashier';status:'Active'|'Inactive'='Active';errors:any={};
  ngOnInit(){this.layout.setTitle('Add Employee');}
  save(){this.errors={};if(!this.name.trim())this.errors.name='Full name is required';if(!this.username.trim())this.errors.username='Username is required';else if(this.data.getEmployees().some(e=>e.username.toLowerCase()===this.username.trim().toLowerCase()))this.errors.username='This username is already in use';if(Object.keys(this.errors).length)return;const list=this.data.getEmployees();const employee:Employee={id:uid('EMP'),name:this.name.trim(),username:this.username.trim(),mobile:this.mobile.trim(),role:this.role,status:this.status,createdDate:nowISO()};list.push(employee);this.data.saveEmployees(list);this.notifications.add('info','Employee Added',`${employee.name} was added.`);this.toast.show('Employee Saved','Employee added successfully','success');this.router.navigate(['/employees']);}
  cancel(){this.router.navigate(['/employees']);}
}
