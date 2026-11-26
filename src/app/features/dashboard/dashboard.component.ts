import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { DataService } from '../../core/services/data.service';
import { CalcService } from '../../core/services/calc.service';
import { fmtAmount, fmtDateTime, todayISO } from '../../core/utils/formatters';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
@Component({ selector:'app-dashboard', standalone:true, imports:[RouterLink,CurrencyFormatPipe], template:`
<div class="page-head"><div><h1>Dashboard</h1><p class="subtitle">ShopKhata overview</p></div></div>
<div class="stats-grid"><div class="stat-card"><span>Total Customers</span><strong>{{calc.totalCustomers()}}</strong></div><div class="stat-card red"><span>Outstanding Receivable</span><strong>{{calc.totalOutstanding()|currencyFormat}}</strong></div><div class="stat-card orange"><span>Today's Khata Entries</span><strong>{{todaysEntries.length}}</strong></div><div class="stat-card green"><span>Today's Received</span><strong>{{calc.todaysPaymentTotal()|currencyFormat}}</strong></div><div class="stat-card"><span>Total Transactions</span><strong>{{calc.totalTransactions()}}</strong></div></div>
<div class="card"><h3 class="card-title"><i class="fas fa-bolt"></i> Quick Actions</h3><div class="quick-actions"><a class="btn btn-primary" routerLink="/customers/add"><i class="fas fa-user-plus"></i> Add Customer</a><a class="btn btn-primary" routerLink="/khata/new"><i class="fas fa-plus-circle"></i> New Khata Entry</a><a class="btn btn-green" routerLink="/payments/receive"><i class="fas fa-money-bill-wave"></i> Receive Payment</a><a class="btn btn-outline" routerLink="/customers"><i class="fas fa-users"></i> View Customers</a><a class="btn btn-navy" routerLink="/reports/daily"><i class="fas fa-chart-bar"></i> View Reports</a></div></div>
<div class="card"><h3 class="card-title"><i class="fas fa-chart-line"></i> Last 7 Days Activity</h3><div class="bar-chart">@for (d of chartData; track d.date) { <div class="bar-column"><div class="bar entry" [style.height.%]="d.entryHeight"></div><small>{{d.label}}</small></div> }</div></div>
<div class="dashboard-grid"><div class="card"><h3 class="card-title">Recent Khata Transactions</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Ref</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th></tr></thead><tbody>@for(t of recentTransactions; track t.id){<tr><td>{{t.reference}}</td><td>{{customerName(t.customerId)}}</td><td>{{itemSummary(t.items)}}</td><td class="amount">{{t.total|currencyFormat}}</td><td>{{fmtDate(t.dateTime)}}</td></tr>} @empty {<tr><td colspan="5" class="text-center">No transactions</td></tr>}</tbody></table></div></div>
<div class="card"><h3 class="card-title">Recent Payments</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Ref</th><th>Customer</th><th>Amount</th><th>Date</th></tr></thead><tbody>@for(p of recentPayments; track p.id){<tr><td>{{p.reference}}</td><td>{{customerName(p.customerId)}}</td><td class="amount text-green">{{p.amount|currencyFormat}}</td><td>{{fmtDate(p.dateTime)}}</td></tr>}</tbody></table></div></div></div>
<div class="card"><h3 class="card-title">Top Outstanding</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Balance</th><th>Action</th></tr></thead><tbody>@for(c of topOutstanding; track c.id){<tr><td>{{c.name}}</td><td>{{c.mobile}}</td><td class="amount text-red">{{calc.customerBalance(c.id)|currencyFormat}}</td><td><a class="btn btn-xs btn-outline" [routerLink]="['/ledger']" [queryParams]="{customer:c.id}">Ledger</a></td></tr>}</tbody></table></div></div>` })
export class DashboardComponent implements OnInit {
  private layout=inject(LayoutService); private data=inject(DataService); calc=inject(CalcService);
  todaysEntries=this.calc.todaysEntries(); recentTransactions:any[]=[]; recentPayments:any[]=[]; topOutstanding:any[]=[]; chartData:any[]=[]; fmtDate=fmtDateTime;
  ngOnInit():void {
    this.layout.setTitle('Dashboard');
    const tx=[...this.data.getTransactions()].sort((a,b)=>b.dateTime.localeCompare(a.dateTime)); this.recentTransactions=tx.slice(0,5);
    this.recentPayments=[...this.data.getPayments()].sort((a,b)=>b.dateTime.localeCompare(a.dateTime)).slice(0,5);
    this.topOutstanding=this.data.getCustomers().filter(c=>c.status==='Active').sort((a,b)=>this.calc.customerBalance(b.id)-this.calc.customerBalance(a.id)).slice(0,5);
    const amounts: number[]=[]; this.chartData=[];
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);const amount=this.data.getTransactions().filter(t=>t.status==='Completed'&&!t.reversed&&t.dateTime.slice(0,10)===key).reduce((sum,t)=>sum+Math.round(t.total*100),0)/100;amounts.push(amount);this.chartData.push({date:key,label:d.toLocaleDateString('en-PK',{weekday:'short'}),entryAmount:amount});}
    const max=Math.max(1,...amounts); this.chartData=this.chartData.map(d=>({...d,entryHeight:(d.entryAmount/max)*100}));
  }
  customerName(id:string):string{return this.data.getCustomers().find(c=>c.id===id)?.name||'Unknown';}
  itemSummary(items:any[]):string{return items.map(i=>i.desc).join(', ').slice(0,60);}
}
