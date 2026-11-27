import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShopSettings } from '../../../core/models/settings.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-shop-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head"><h1>Shop Settings</h1></div>
    <div class="card">
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-group"><label>Shop Name</label><input [(ngModel)]="settings.shopName" name="shopName"></div>
          <div class="form-group"><label>Owner Name</label><input [(ngModel)]="settings.ownerName" name="ownerName"></div>
          <div class="form-group"><label>Mobile</label><input [(ngModel)]="settings.mobile" name="mobile"></div>
          <div class="form-group"><label>Currency</label><input [(ngModel)]="settings.currency" name="currency"></div>
          <div class="form-group full"><label>Address</label><input [(ngModel)]="settings.address" name="address"></div>
          <div class="form-group full"><label>Logo URL</label><input [(ngModel)]="settings.logo" name="logo"></div>
          <div class="form-group full"><label>Receipt Footer</label><textarea [(ngModel)]="settings.receiptFooter" name="receiptFooter"></textarea></div>
          <div class="form-group full">
            <label>WhatsApp Payment Message</label>
            <textarea maxlength="1000" [(ngModel)]="settings.whatsAppPaymentTemplate" name="whatsAppPaymentTemplate"
              placeholder="Hello {customerName}, your payment of {amount} was received on {date}. Balance: {balance}. - {shopName}"></textarea>
            <small class="field-hint">Available placeholders: customerName, amount, date, balance, paymentMethod, and shopName.</small>
          </div>
        </div>
        <button class="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
  `,
})
export class ShopSettingsComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  settings: ShopSettings = this.data.getSettings();

  ngOnInit(): void {
    this.layout.setTitle('Shop Settings');
  }

  async save(): Promise<void> {
    try {
      await this.api.put('/settings', {
        shopName: this.settings.shopName,
        phone: this.settings.mobile,
        currency: 'PKR',
        address: this.settings.address,
        receiptFooter: this.settings.receiptFooter,
        whatsAppPaymentTemplate: this.settings.whatsAppPaymentTemplate || '',
      });
      this.data.saveSettings({ ...this.settings, currency: 'PKR' });
      this.toast.show('Settings Saved', 'Shop settings saved to the database', 'success');
    } catch (error: unknown) {
      this.toast.show('Save Failed', error instanceof Error ? error.message : 'Could not save settings', 'error');
    }
  }
}
