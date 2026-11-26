import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ModalService, ModalButton } from '../../../core/services/modal.service';
@Component({ selector:'app-modal', standalone:true, imports:[AsyncPipe], template:`
<div class="modal-overlay" [class.open]="(modalService.modal$ | async) !== null" (click)="overlayClick($event)">
  @if (modalService.modal$ | async; as modal) {
    <div class="modal" role="dialog">
      <div class="modal-header"><h3>{{modal.title}}</h3><button type="button" (click)="modalService.close()"><i class="fas fa-times"></i></button></div>
      <div class="modal-body" [innerHTML]="modal.safeBody"></div>
      <div class="modal-footer">@for (b of modal.buttons || []; track b.label) { <button type="button" class="btn {{b.className||''}}" (click)="buttonClick(b)">{{b.label}}</button> }</div>
    </div>
  }
</div>` })
export class ModalComponent {
  modalService=inject(ModalService);
  buttonClick(b:ModalButton):void { if(b.close) this.modalService.close(); b.onClick?.(); }
  overlayClick(event:MouseEvent):void { if(event.target===event.currentTarget) this.modalService.close(); }
}
