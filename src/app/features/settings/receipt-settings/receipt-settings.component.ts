import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShopSettingsDto } from '../../../core/models/api.models';
import { ShopSettings } from '../../../core/models/settings.model';

@Component({
  selector: 'app-receipt-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head"><h1>Receipt Settings</h1></div>
    <div class="card">
      <form (ngSubmit)="save()">
        <div class="toggle-row"><label><input type="checkbox" [(ngModel)]="settings.showMobile" name="showMobile"> Show Mobile</label></div>
        <div class="toggle-row"><label><input type="checkbox" [(ngModel)]="settings.showAddress" name="showAddress"> Show Address</label></div>
        <div class="toggle-row"><label><input type="checkbox" [(ngModel)]="settings.showFooter" name="showFooter"> Show Footer</label></div>
        <button class="btn btn-primary" type="submit" [disabled]="saving">{{saving ? 'Saving…' : 'Save Receipt Settings'}}</button>
      </form>
    </div>
  `,
})
export class ReceiptSettingsComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  settings: ShopSettings = { ...this.data.getSettings() };
  saving = false;

  ngOnInit(): void { this.layout.setTitle('Receipt Settings'); }

  async save(): Promise<void> {
    this.saving = true;
    try {
      const saved = await firstValueFrom(this.api.put<ShopSettingsDto>('/settings', {
        shopName: this.settings.shopName, phone: this.settings.mobile || null,
        currency: this.settings.currency, address: this.settings.address || null,
        receiptFooter: this.settings.receiptFooter || null, showMobile: this.settings.showMobile,
        showAddress: this.settings.showAddress, showFooter: this.settings.showFooter,
      }));
      this.settings = { ...this.settings, showMobile: saved.showMobile,
        showAddress: saved.showAddress, showFooter: saved.showFooter };
      this.data.saveSettings(this.settings);
      this.toast.show('Receipt Settings Saved', 'Receipt settings saved to the database.', 'success');
    } catch (error) {
      this.toast.show('Save Failed', apiErrorMessage(error), 'error');
    } finally {
      this.saving = false;
    }
  }
}
