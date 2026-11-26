import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { DataService } from './data.service';
import { AppNotification } from '../models/notification.model';
import { nowISO, uid } from '../utils/formatters';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private data = inject(DataService);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.data.getNotifications());
  notifications$: Observable<AppNotification[]> = this.notificationsSubject.asObservable();
  unreadCount$: Observable<number> = this.notifications$.pipe(map(list => list.filter(n => !n.read).length));
  add(type: AppNotification['type'], title: string, message: string): void {
    const list = this.data.getNotifications();
    list.unshift({ id:uid('N'), type, title, message, time:nowISO(), read:false });
    const capped = list.slice(0,100);
    this.data.saveNotifications(capped); this.refresh();
  }
  markAllRead(): void { const list=this.data.getNotifications().map(n=>({...n,read:true})); this.data.saveNotifications(list); this.refresh(); }
  markRead(id:string): void { const list=this.data.getNotifications().map(n=>n.id===id?{...n,read:true}:n); this.data.saveNotifications(list); this.refresh(); }
  refresh(): void { this.notificationsSubject.next(this.data.getNotifications()); }
}
