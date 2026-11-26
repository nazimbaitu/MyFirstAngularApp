import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './core/services/data.service';
import { initDemoData } from './core/demo-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  private data = inject(DataService);
  ngOnInit(): void { initDemoData(this.data); }
}
