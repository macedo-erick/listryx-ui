import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

import { injectTranslate } from '../core/i18n/translate';

@Component({
  selector: 'listryx-not-found-page',
  imports: [RouterLink, Button],
  template: `
    <div class="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <i class="pi pi-compass text-4xl text-[var(--p-text-muted-color)]" aria-hidden="true"></i>
      <h1 class="m-0 text-xl font-semibold text-[var(--p-text-color)]">
        {{ t('notFound.title') }}
      </h1>
      <p class="m-0 text-[var(--p-text-muted-color)]">{{ t('notFound.message') }}</p>
      <p-button routerLink="/lists" [label]="t('notFound.back')" />
    </div>
  `,
  host: { class: 'block h-full' },
})
export class NotFoundPage {
  protected readonly t = injectTranslate();
}
