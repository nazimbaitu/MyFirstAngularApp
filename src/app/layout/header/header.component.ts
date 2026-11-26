import { Component, inject, HostListener } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataService } from '../../core/services/data.service';
import { ModalService } from '../../core/services/modal.service';
import { initials } from '../../core/utils/formatters';
@Component({ selector:'app-header', standalone:true, imports:[AsyncPipe,RouterLink], template:`
<header class="top-header"><button class="menu-toggle" type="button" (click)="layout.toggleSidebar()"><i class="fas fa-bars"></i></button><h2>{{layout.pageTitle$|async}}</h2><div class="header-right"><span>{{settings.shopName}}</span><button class="header-icon" type="button" routerLink="/notifications"><i class="fas fa-bell"></i>@if ((notifications.unreadCount$|async)||0; as count) { <b class="header-badge">{{count>99?'99+':count}}</b> }</button><div class="profile-menu"><button type="button" class="avatar" (click)="dropdown=!dropdown">{{initials(profile.name)}}</button>@if(dropdown){<div class="dropdown"><a routerLink="/profile" (click)="dropdown=false">My Profile</a><a routerLink="/settings/shop" (click)="dropdown=false">Settings</a><button type="button" (click)="resetDemo()">Reset Demo Data</button></div>}</div></div></header>` })
export class HeaderComponent {
  layout=inject(LayoutService); notifications=inject(NotificationService); private data=inject(DataService); private modal=inject(ModalService); private router=inject(Router);
  settings=this.data.getSettings(); profile=this.data.getProfile(); dropdown=false; initials=initials;
  resetDemo():void { this.dropdown=false; this.modal.confirm('Reset Demo Data','This will remove all ShopKhata data and restore demo records.',()=>{this.data.resetAll(); location.reload();}); }
  @HostListener('document:click',['$event'])
  outside(event:MouseEvent):void { if(!(event.target as HTMLElement).closest('.profile-menu')) this.dropdown=false; }
}
