import { Component, input } from '@angular/core';

@Component({
  selector: 'listryx-card',
  template: `
    <div
      class="h-full overflow-hidden rounded-xl border border-[var(--p-content-border-color)] bg-[var(--p-content-background)] shadow-sm"
      [class.p-4]="padded()"
    >
      <ng-content select="[card-header]" />
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ListryxCard {
  readonly padded = input(false);
}
