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
  selector: 'app-shop-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head"><h1>Shop Settings</h1></div>
    <div class="card">
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-group"><label for="shopName">Shop Name</label><input id="shopName" [(ngModel)]="settings.shopName" name="shopName" required></div>
          <div class="form-group"><label for="mobile">Mobile</label><input id="mobile" [(ngModel)]="settings.mobile" name="mobile"></div>
          <div class="form-group"><label for="currency">Currency (ISO code)</label><input id="currency" [(ngModel)]="settings.currency" name="currency" minlength="3" maxlength="3" required></div>
          <div class="form-group full"><label for="address">Address</label><input id="address" [(ngModel)]="settings.address" name="address"></div>
          <div class="form-group full"><label for="receiptFooter">Receipt Footer</label><textarea id="receiptFooter" [(ngModel)]="settings.receiptFooter" name="receiptFooter"></textarea></div>
        </div>
        <button class="btn btn-primary" type="submit" [disabled]="saving">{{saving ? 'Saving…' : 'Save Settings'}}</button>
      </form>
    </div>
  `,
})
export class ShopSettingsComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  settings: ShopSettings = { ...this.data.getSettings() };
  saving = false;

  ngOnInit(): void { this.layout.setTitle('Shop Settings'); }

  async save(): Promise<void> {
    if (!this.settings.shopName.trim() || !/^[A-Za-z]{3}$/.test(this.settings.currency)) {
      this.toast.show('Validation Error', 'Enter a shop name and a three-letter currency code.', 'error');
      return;
    }
    this.saving = true;
    try {
      const saved = await firstValueFrom(this.api.put<ShopSettingsDto>('/settings', this.toRequest()));
      this.settings = { ...this.settings, shopName: saved.shopName, mobile: saved.phone ?? '',
        address: saved.address ?? '', currency: saved.currency, receiptFooter: saved.receiptFooter ?? '',
        showMobile: saved.showMobile, showAddress: saved.showAddress, showFooter: saved.showFooter };
      this.data.saveSettings(this.settings);
      this.toast.show('Settings Saved', 'Shop settings saved to the database.', 'success');
    } catch (error) {
      this.toast.show('Save Failed', apiErrorMessage(error), 'error');
    } finally {
      this.saving = false;
    }
  }

  private toRequest(): ShopSettingsDto {
    return {
      shopName: this.settings.shopName.trim(), phone: this.settings.mobile.trim() || null,
      currency: this.settings.currency.trim().toUpperCase(), address: this.settings.address.trim() || null,
      receiptFooter: this.settings.receiptFooter.trim() || null, showMobile: this.settings.showMobile,
      showAddress: this.settings.showAddress, showFooter: this.settings.showFooter,
    };
  }
}
