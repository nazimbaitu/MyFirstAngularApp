import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './core/services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet],
  template: `
    <router-outlet></router-outlet>
    @if (data.loading$ | async) {
      <div class="api-loading" role="status">Loading data from the API…</div>
    }
  `,
  styles: [`
    .api-loading { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; background: #ffffffdd; color: #233044; font-weight: 600; }
  `],
})
export class AppComponent {
  readonly data = inject(DataService);
}
