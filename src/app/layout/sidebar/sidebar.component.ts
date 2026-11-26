import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { LayoutService } from '../../core/services/layout.service';
import { NotificationService } from '../../core/services/notification.service';
@Component({ selector:'app-sidebar', standalone:true, imports:[AsyncPipe,RouterLink,RouterLinkActive], template:`
@if (layout.sidebarOpen$ | async) { <div class="sidebar-overlay" (click)="layout.closeSidebar()"></div> }
<aside class="sidebar" [class.open]="(layout.sidebarOpen$ | async)">
<div class="brand">@if (settings.logo) { <img [src]="settings.logo" alt="Logo"> } @else { <i class="fas fa-store brand-icon"></i> }<div><strong>{{settings.shopName}}</strong><small>Management</small></div></div>
<nav>
<a routerLink="/dashboard" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-chart-pie"></i><span>Dashboard</span></a>
<div class="nav-group"><small><i class="fas fa-users"></i> Customers</small><a routerLink="/customers" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-list"></i> All Customers</a><a routerLink="/customers/add" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-user-plus"></i> Add Customer</a></div>
<div class="nav-group"><small><i class="fas fa-book"></i> Khata Management</small><a routerLink="/khata/new" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-plus-circle"></i> New Khata Entry</a><a routerLink="/transactions" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-exchange-alt"></i> All Transactions</a><a routerLink="/ledger" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-scroll"></i> Customer Ledger</a></div>
<div class="nav-group"><small><i class="fas fa-hand-holding-usd"></i> Payments</small><a routerLink="/payments/receive" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-money-bill-wave"></i> Receive Payment</a><a routerLink="/payments/history" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-history"></i> Payment History</a></div>
<div class="nav-group"><small><i class="fas fa-user-tie"></i> Employees</small><a routerLink="/employees" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-users"></i> All Employees</a><a routerLink="/employees/add" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-user-plus"></i> Add Employee</a></div>
<div class="nav-group"><small><i class="fas fa-chart-bar"></i> Reports</small><a routerLink="/reports/daily" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-calendar-day"></i> Daily Summary</a><a routerLink="/reports/monthly" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-calendar-alt"></i> Monthly Summary</a><a routerLink="/reports/outstanding" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-exclamation-triangle"></i> Outstanding Balances</a></div>
<a routerLink="/notifications" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-bell"></i><span>Notifications</span>@if ((notificationService.unreadCount$|async)||0; as count) { <b class="nav-badge">{{count>99?'99+':count}}</b> }</a>
<div class="nav-group"><small><i class="fas fa-cog"></i> Settings</small><a routerLink="/settings/shop" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-store-alt"></i> Shop Settings</a><a routerLink="/settings/receipt" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-receipt"></i> Receipt Settings</a></div>
<a routerLink="/profile" routerLinkActive="active" (click)="layout.closeSidebar()"><i class="fas fa-user-circle"></i> My Profile</a>
</nav><div class="sidebar-footer"><i class="fas fa-flask"></i> Demo mode — localStorage</div></aside>` })
export class SidebarComponent {
  layout=inject(LayoutService); notificationService=inject(NotificationService);
  private data=inject(DataService); settings=this.data.getSettings();
}
