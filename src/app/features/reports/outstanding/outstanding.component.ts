import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { CalcService } from '../../../core/services/calc.service';
import { fmtAmount,fmtDate } from '../../../core/utils/formatters';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
@Component({selector:'app-outstanding',standalone:true,imports:[FormsModule,RouterLink,CurrencyFormatPipe],template:`<div class="page-head"><h1>Outstanding Balances</h1><button class="btn btn-navy" (click)="print()"><i class="fas fa-print"></i> Export / Print</button></div><div class="card toolbar"><div class="search-input-wrap"><i class="fas fa-search"></i><input [(ngModel)]="search" (ngModelChange)="apply()" placeholder="Search customer"></div></div><div class="card table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Customer</th><th>Mobile</th><th>Balance</th><th>Last Transaction</th><th>Action</th></tr></thead><tbody>@for(c of filtered;track c.id;let i=$index){<tr><td>{{i+1}}</td><td>{{c.name}}</td><td>{{c.mobile}}</td><td class="amount text-red">{{calc.customerBalance(c.id)|currencyFormat}}</td><td>{{fmtDate(calc.lastTxDate(c.id))}}</td><td><a class="btn btn-xs btn-outline" [routerLink]="['/ledger']" [queryParams]="{customer:c.id}">Ledger</a></td></tr>}<tr><td colspan="3"><b>Total</b></td><td class="amount text-red"><b>{{total|currencyFormat}}</b></td><td colspan="2"></td></tr></tbody></table></div>`})
export class OutstandingComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);calc=inject(CalcService);search='';filtered:any[]=[];total=0;fmtDate=fmtDate;
  ngOnInit(){this.layout.setTitle('Outstanding Balances');this.apply();}
  apply(){const q=this.search.toLowerCase();this.filtered=this.data.getCustomers().filter(c=>c.status==='Active'&&this.calc.customerBalance(c.id)>0&&(!q||c.name.toLowerCase().includes(q)||c.mobile.toLowerCase().includes(q))).sort((a,b)=>this.calc.customerBalance(b.id)-this.calc.customerBalance(a.id));this.total=this.filtered.reduce((s,c)=>s+Math.round(this.calc.customerBalance(c.id)*100),0)/100;}
  print(){window.print();}
}
