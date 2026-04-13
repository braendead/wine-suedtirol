import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedToolbarComponent } from './shared/components/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedToolbarComponent],
  template: `
    <app-toolbar></app-toolbar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      height: calc(100vh - 64px); /* Subtract toolbar height */
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'wine-suedtirol';
}
