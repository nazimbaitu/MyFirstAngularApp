import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
@Component({ selector:'app-layout', standalone:true, imports:[RouterOutlet,SidebarComponent,HeaderComponent,ToastContainerComponent,ModalComponent], template:`
<div class="app-wrapper"><app-sidebar></app-sidebar><div class="main-area"><app-header></app-header><main class="view-container"><router-outlet></router-outlet></main></div></div>
<app-toast-container></app-toast-container><app-modal></app-modal><div id="printArea" class="print-area"></div>` })
export class AppLayoutComponent {}
