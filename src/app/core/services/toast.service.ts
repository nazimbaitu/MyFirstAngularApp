import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export interface Toast { id:number; title:string; message:string; type:'success'|'error'|'warning'|'info'; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId=1;
  private subject=new BehaviorSubject<Toast[]>([]);
  toasts$:Observable<Toast[]>=this.subject.asObservable();
  show(title:string,message:string,type:'success'|'error'|'warning'|'info'):void {
    const toast={id:this.nextId++,title,message,type};
    this.subject.next([...this.subject.value,toast]);
    setTimeout(()=>this.dismiss(toast.id),5000);
  }
  dismiss(id:number):void { this.subject.next(this.subject.value.filter(t=>t.id!==id)); }
}
