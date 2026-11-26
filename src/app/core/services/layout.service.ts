import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private titleSubject=new BehaviorSubject('Dashboard');
  pageTitle$:Observable<string>=this.titleSubject.asObservable();
  setTitle(title:string):void { this.titleSubject.next(title); }
  private sidebarSubject=new BehaviorSubject(false);
  sidebarOpen$:Observable<boolean>=this.sidebarSubject.asObservable();
  openSidebar():void { this.sidebarSubject.next(true); }
  closeSidebar():void { this.sidebarSubject.next(false); }
  toggleSidebar():void { this.sidebarSubject.next(!this.sidebarSubject.value); }
}
