import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { esc } from '../utils/formatters';
export interface ModalButton { label:string; className?:string; close?:boolean; onClick?:()=>void; }
export interface ModalConfig { title:string; body:string; buttons?:ModalButton[]; safeBody?:SafeHtml; }
@Injectable({ providedIn: 'root' })
export class ModalService {
  private sanitizer=inject(DomSanitizer);
  private subject=new BehaviorSubject<(ModalConfig & {safeBody:SafeHtml})|null>(null);
  modal$:Observable<(ModalConfig & {safeBody:SafeHtml})|null>=this.subject.asObservable();
  open(config:ModalConfig):void { this.subject.next({...config,body:config.body,safeBody:this.sanitizer.bypassSecurityTrustHtml(config.body)}); }
  close():void { this.subject.next(null); }
  confirm(title:string,message:string,onConfirm:()=>void):void {
    this.open({ title, body:`<p>${esc(message)}</p>`, buttons:[
      {label:'Cancel',className:'btn-outline',close:true},
      {label:'Confirm',className:'btn-danger',close:true,onClick:onConfirm}
    ]});
  }
}
