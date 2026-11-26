import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, forkJoin, map } from 'rxjs';
import { DataService } from './data.service';
import { ApiService, apiErrorMessage } from './api.service';
import { ToastService } from './toast.service';
import { AppNotification } from '../models/notification.model';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private data = inject(DataService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  notifications$: Observable<AppNotification[]> = this.data.notifications$;
  unreadCount$: Observable<number> = this.notifications$.pipe(map(list => list.filter(n => !n.read).length));

  async markAllRead(): Promise<void> {
    const unread = this.data.getNotifications().filter(item => !item.read);
    if (!unread.length) return;
    try {
      await firstValueFrom(forkJoin(unread.map(item =>
        this.api.post<void>(`/notifications/${item.id}/read`, {}),
      )));
      await firstValueFrom(this.data.reloadNotifications());
    } catch (error) {
      this.toast.show('Update Failed', apiErrorMessage(error), 'error');
    }
  }

  async markRead(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.post<void>(`/notifications/${id}/read`, {}));
      await firstValueFrom(this.data.reloadNotifications());
    } catch (error) {
      this.toast.show('Update Failed', apiErrorMessage(error), 'error');
    }
  }
}
