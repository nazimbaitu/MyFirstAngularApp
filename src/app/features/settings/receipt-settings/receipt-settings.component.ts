import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReceiptSettings } from '../../../core/models/settings.model';
@Component({selector:'app-receipt-settings',standalone:true,imports:[FormsModule],template:`<div class="page-head"><h1>Receipt Settings</h1></div><div class="card"><div class="toggle-row"><label><input type="checkbox" [(ngModel)]="settings.showMobile"> Show Mobile</label></div><div class="toggle-row"><label><input type="checkbox" [(ngModel)]="settings.showAddress"> Show Address</label></div><div class="toggle-row"><label><input type="checkbox" [(ngModel)]="settings.showFooter"> Show Footer</label></div><button class="btn btn-primary" (click)="save()">Save Receipt Settings</button></div>`})
export class ReceiptSettingsComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private toast=inject(ToastService);settings:ReceiptSettings=this.data.getReceiptSettings();
  ngOnInit(){this.layout.setTitle('Receipt Settings');}
  save(){this.data.saveReceiptSettings({...this.settings});this.toast.show('Receipt Settings Saved','Receipt options updated','success');}
}
