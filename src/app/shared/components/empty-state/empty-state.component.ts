import { Component, Input } from '@angular/core';
@Component({ selector:'app-empty-state', standalone:true, template:`<div class="empty-state"><i class="fas {{icon}}"></i><h3>{{title}}</h3><p>{{message}}</p></div>` })
export class EmptyStateComponent {
  @Input() icon='fa-info-circle'; @Input() title=''; @Input() message='';
}
