import { Component,OnInit,inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LayoutService } from '../../core/services/layout.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
@Component({selector:'app-notifications',standalone:true,imports:[AsyncPipe,EmptyStateComponent],template:`<div class="page-head"><h1>Notifications</h1><button class="btn btn-outline" (click)="notifications.markAllRead()">Mark All Read</button></div>@if((notifications.notifications$|async)?.length){<div class="card notification-list">@for(n of notifications.notifications$|async;track n.id){<button class="notification-item" [class.unread]="!n.read" (click)="notifications.markRead(n.id)"><i class="fas {{n.type==='credit'?'fa-book':n.type==='payment'?'fa-money-bill-wave':n.type==='warning'?'fa-triangle-exclamation':'fa-circle-info'}}"></i><div><b>{{n.title}}</b><p>{{n.message}}</p><small>{{relative(n.time)}}</small></div>@if(!n.read){<span class="unread-dot"></span>}</button>} </div>}@else{<app-empty-state icon="fa-bell" title="No notifications" message="You're all caught up."></app-empty-state>}`})
export class NotificationsComponent implements OnInit {
  private layout=inject(LayoutService);notifications=inject(NotificationService);ngOnInit(){this.layout.setTitle('Notifications');}
  relative(time:string){const ms=Date.now()-new Date(time).getTime();const h=Math.floor(ms/3600000);if(h<1)return'Just now';if(h<24)return`${h} hours ago`;return `${Math.floor(h/24)} days ago`;}
}
