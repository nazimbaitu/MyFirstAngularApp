import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
@Component({ selector:'app-toast-container', standalone:true, imports:[AsyncPipe], template:`
<div class="toast-container">
  @for (t of toastService.toasts$ | async; track t.id) {
    <div class="toast {{t.type}}"><i class="fas {{t.type==='success'?'fa-circle-check':t.type==='error'?'fa-circle-xmark':t.type==='warning'?'fa-triangle-exclamation':'fa-circle-info'}}"></i><div><b>{{t.title}}</b><small>{{t.message}}</small></div><button type="button" (click)="toastService.dismiss(t.id)"><i class="fas fa-times"></i></button></div>
  }
</div>` })
export class ToastContainerComponent { toastService=inject(ToastService); }
