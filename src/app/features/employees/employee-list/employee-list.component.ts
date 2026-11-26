import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ModalService } from '../../../core/services/modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { Employee } from '../../../core/models/employee.model';
import { fmtDate } from '../../../core/utils/formatters';
import { firstValueFrom } from 'rxjs';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  template: `
    <div class="page-head"><h1>Employees</h1><a class="btn btn-primary" routerLink="/employees/add"><i class="fas fa-user-plus"></i> Add Employee</a></div>
    @if (employees.length) {
      <div class="card table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Mobile</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
      @for(e of employees;track e.id){<tr><td>{{e.id}}</td><td>{{e.name}}</td><td>{{e.username}}</td><td>{{e.mobile||'—'}}</td><td><span class="pill" [class.pill-admin]="e.role==='Owner / Admin'" [class.pill-cashier]="e.role==='Employee / Cashier'">{{e.role==='Owner / Admin'?'Admin':'Cashier'}}</span></td><td><span class="pill" [class.pill-active]="e.status==='Active'" [class.pill-inactive]="e.status==='Inactive'">{{e.status}}</span></td><td>{{fmtDate(e.createdDate)}}</td><td><button class="btn btn-xs btn-outline" (click)="toggle(e)">{{e.status==='Active'?'Deactivate':'Activate'}}</button></td></tr>}
      </tbody></table></div>
    } @else {
      <app-empty-state icon="fa-users" title="No employees found" message="Add an employee to get started."></app-empty-state>
    }
    <div class="card"><h3 class="card-title"><i class="fas fa-shield-alt"></i> Role Permissions</h3><p><b>Owner / Admin:</b> Full access to owner-only API operations.</p><p><b>Employee / Cashier:</b> Access is enforced by the API.</p></div>
  `,
})
export class EmployeeListComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly modal = inject(ModalService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  employees: Employee[] = [];
  readonly fmtDate = fmtDate;

  ngOnInit(): void {
    this.layout.setTitle('Employees');
    this.employees = this.data.getEmployees();
  }

  toggle(employee: Employee): void {
    const next = employee.status === 'Active' ? 'Inactive' : 'Active';
    const status = next === 'Inactive' ? 1 : 0;
    this.modal.confirm(`Set ${employee.name} to ${next}?`, `Change employee status to ${next}?`, async () => {
      try {
        await firstValueFrom(this.api.patch<void>(`/employees/${employee.id}/status?status=${status}`, {}));
        this.employees = await firstValueFrom(this.data.reloadEmployees());
        this.toast.show('Status Updated', `${employee.name} is now ${next}.`, 'success');
      } catch (error) {
        this.toast.show('Update Failed', apiErrorMessage(error), 'error');
      }
    });
  }
}
