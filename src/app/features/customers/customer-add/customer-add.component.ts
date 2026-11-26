import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { CreateCustomerRequest, CustomerDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-customer-add',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head"><div><h1>Add Customer</h1></div><button class="btn btn-outline" (click)="cancel()">Cancel</button></div>
    <div class="card">
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-group"><label for="name">Full Name *</label><input id="name" [(ngModel)]="name" name="name" required><div class="field-error">{{errors.name}}</div></div>
          <div class="form-group"><label for="mobile">Mobile *</label><input id="mobile" [(ngModel)]="mobile" name="mobile" required><div class="field-error">{{errors.mobile}}</div></div>
          <div class="form-group full"><label for="address">Address</label><input id="address" [(ngModel)]="address" name="address"></div>
          <div class="form-group"><label for="openingBalance">Opening Balance</label><input id="openingBalance" type="number" min="0" [(ngModel)]="openingBalance" name="openingBalance"><div class="field-error">{{errors.openingBalance}}</div></div>
          <div class="form-group full"><label for="notes">Notes</label><textarea id="notes" [(ngModel)]="notes" name="notes"></textarea></div>
        </div>
        <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="saving">{{saving ? 'Saving…' : 'Save Customer'}}</button><button class="btn btn-outline" type="button" (click)="cancel()">Cancel</button></div>
      </form>
    </div>
  `,
})
export class CustomerAddComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  name = '';
  mobile = '';
  address = '';
  openingBalance = 0;
  notes = '';
  errors: { name?: string; mobile?: string; openingBalance?: string } = {};
  saving = false;

  ngOnInit(): void { this.layout.setTitle('Add Customer'); }

  async save(): Promise<void> {
    this.errors = {};
    if (!this.name.trim()) this.errors.name = 'Full name is required.';
    if (!/^[0-9+\-\s]{7,15}$/.test(this.mobile.trim())) this.errors.mobile = 'Enter a valid mobile number.';
    if (this.data.getCustomers().some(customer => customer.mobile === this.mobile.trim())) {
      this.errors.mobile = 'This mobile number is already registered.';
    }
    if (!Number.isFinite(Number(this.openingBalance)) || Number(this.openingBalance) < 0) {
      this.errors.openingBalance = 'Opening balance cannot be negative.';
    }
    if (Object.keys(this.errors).length || this.saving) return;

    this.saving = true;
    try {
      const request: CreateCustomerRequest = {
        name: this.name.trim(), mobile: this.mobile.trim(), address: this.address.trim() || null,
        openingBalance: Number(this.openingBalance), notes: this.notes.trim() || null,
      };
      const saved = await firstValueFrom(this.api.post<CustomerDto>('/customers', request));
      await firstValueFrom(this.data.reloadCustomers());
      this.toast.show('Customer Saved', `${saved.name} was saved to the database.`, 'success');
      await this.router.navigate(['/customers']);
    } catch (error) {
      this.toast.show('Save Failed', apiErrorMessage(error), 'error');
    } finally {
      this.saving = false;
    }
  }

  cancel(): void { void this.router.navigate(['/customers']); }
}
