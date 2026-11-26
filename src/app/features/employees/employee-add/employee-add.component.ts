import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { CreateEmployeeRequest, EmployeeDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head"><h1>Add Employee</h1></div>
    <div class="card">
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-group"><label for="name">Full Name *</label><input id="name" [(ngModel)]="name" name="name" required><div class="field-error">{{errors.name}}</div></div>
          <div class="form-group"><label for="username">Username *</label><input id="username" [(ngModel)]="username" name="username" required><div class="field-error">{{errors.username}}</div></div>
          <div class="form-group"><label for="mobile">Mobile</label><input id="mobile" [(ngModel)]="mobile" name="mobile"></div>
          <div class="form-group"><label for="role">Role</label><select id="role" [(ngModel)]="role" name="role"><option>Employee / Cashier</option><option>Owner / Admin</option></select></div>
          <div class="form-group full"><label for="password">Initial Password * (at least 12 characters)</label><input id="password" type="password" [(ngModel)]="password" name="password" minlength="12" autocomplete="new-password" required><div class="field-error">{{errors.password}}</div></div>
        </div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="saving">{{saving ? 'Saving…' : 'Save Employee'}}</button><button class="btn btn-outline" type="button" (click)="cancel()">Cancel</button></div>
      </form>
    </div>
  `,
})
export class EmployeeAddComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  name = '';
  username = '';
  mobile = '';
  role: 'Owner / Admin' | 'Employee / Cashier' = 'Employee / Cashier';
  password = '';
  errors: { name?: string; username?: string; password?: string } = {};
  saving = false;

  ngOnInit(): void { this.layout.setTitle('Add Employee'); }

  async save(): Promise<void> {
    this.errors = {};
    if (!this.name.trim()) this.errors.name = 'Full name is required.';
    if (!this.username.trim()) this.errors.username = 'Username is required.';
    if (this.data.getEmployees().some(employee => employee.username.toLowerCase() === this.username.trim().toLowerCase())) {
      this.errors.username = 'This username is already in use.';
    }
    if (this.password.length < 12) this.errors.password = 'Password must be at least 12 characters.';
    if (Object.keys(this.errors).length || this.saving) return;

    this.saving = true;
    try {
      const request: CreateEmployeeRequest = {
        name: this.name.trim(), userName: this.username.trim(), mobile: this.mobile.trim() || null,
        role: this.role === 'Owner / Admin' ? 0 : 1, password: this.password,
      };
      const saved = await firstValueFrom(this.api.post<EmployeeDto>('/employees', request));
      await firstValueFrom(this.data.reloadEmployees());
      this.toast.show('Employee Saved', `${saved.name} was saved to the database.`, 'success');
      await this.router.navigate(['/employees']);
    } catch (error) {
      this.toast.show('Save Failed', apiErrorMessage(error), 'error');
    } finally {
      this.saving = false;
      this.password = '';
    }
  }

  cancel(): void { void this.router.navigate(['/employees']); }
}
