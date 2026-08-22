import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'listryx-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  host: { class: 'block h-full' },
})
export class App {}
