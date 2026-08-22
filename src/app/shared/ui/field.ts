import { Component, input } from '@angular/core';

@Component({
  selector: 'listryx-field',
  template: `
    <div class="flex flex-col gap-1">
      <label [for]="inputId()" class="text-sm text-[var(--p-text-muted-color)]">
        {{ label() }}
      </label>

      <ng-content />

      @if (error()) {
        <p class="m-0 text-sm text-[var(--p-red-500)]">{{ error() }}</p>
      } @else if (hint()) {
        <p class="m-0 text-xs text-[var(--p-text-muted-color)]">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ListryxField {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly hint = input('');
  readonly error = input('');
}
