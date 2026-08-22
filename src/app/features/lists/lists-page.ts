import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';

import { injectTranslate } from '../../core/i18n/translate';
import { ListStatus } from '../../shared/models';
import { ListryxCard } from '../../shared/ui/card';
import { ListryxEmptyState } from '../../shared/ui/empty-state';
import { ListryxPageHeader } from '../../shared/ui/page-header';
import { formatDate } from '../../shared/util/date';
import { formatMoney } from '../../shared/util/money';
import { ListFormDialog } from './list-form-dialog';
import { ListService } from './list.service';

@Component({
  selector: 'listryx-lists-page',
  imports: [
    RouterLink,
    FormsModule,
    Button,
    SelectButton,
    ListryxCard,
    ListryxPageHeader,
    ListryxEmptyState,
    ListFormDialog,
  ],
  templateUrl: './lists-page.html',
})
export class ListsPage {
  protected readonly service = inject(ListService);
  private readonly router = inject(Router);
  protected readonly t = injectTranslate();

  protected readonly dialogOpen = signal(false);

  protected readonly statusOptions = computed(() => [
    { label: this.t('lists.open'), value: 'open' as ListStatus },
    { label: this.t('lists.closed'), value: 'closed' as ListStatus },
  ]);

  protected readonly lists = computed(() => this.service.lists());

  constructor() {
    // Item writes update the open list in place rather than firing a second request per tap, so
    // the counts and totals on these cards are stale until something asks for them again.
    this.service.reload();
  }

  protected money(value: string | null): string {
    return formatMoney(value);
  }

  protected date(value: string | null): string {
    return formatDate(value);
  }

  protected onCreated(id: string): void {
    void this.router.navigate(['/lists', id]);
  }
}
