import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShopSettings } from '../../../core/models/settings.model';
@Component({selector:'app-shop-settings',standalone:true,imports:[FormsModule],template:`<div class="page-head"><h1>Shop Settings</h1></div><div class="card"><form (ngSubmit)="save()"><div class="form-grid"><div class="form-group"><label>Shop Name</label><input [(ngModel)]="settings.shopName" name="shopName"></div><div class="form-group"><label>Owner Name</label><input [(ngModel)]="settings.ownerName" name="ownerName"></div><div class="form-group"><label>Mobile</label><input [(ngModel)]="settings.mobile" name="mobile"></div><div class="form-group"><label>Currency</label><input [(ngModel)]="settings.currency" name="currency"></div><div class="form-group full"><label>Address</label><input [(ngModel)]="settings.address" name="address"></div><div class="form-group full"><label>Logo URL</label><input [(ngModel)]="settings.logo" name="logo"></div><div class="form-group full"><label>Receipt Footer</label><textarea [(ngModel)]="settings.receiptFooter" name="receiptFooter"></textarea></div></div><button class="btn btn-primary" type="submit">Save Settings</button></form></div>`})
export class ShopSettingsComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private toast=inject(ToastService);settings:ShopSettings=this.data.getSettings();
  ngOnInit(){this.layout.setTitle('Shop Settings');}
  save(){this.data.saveSettings({...this.settings,currency:'PKR'});this.toast.show('Settings Saved','Shop settings updated successfully','success');}
}
