import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';

import { injectTranslate } from '../../core/i18n/translate';
import { ListDetail, ListItem } from '../../shared/models';
import { ListryxEmptyState } from '../../shared/ui/empty-state';
import { formatMoney, formatQuantity, toDecimalString, toNumber } from '../../shared/util/money';
import { currentCurrency } from '../../shared/util/currency';
import { currentLocale } from '../../shared/util/locale';
import { ListService } from './list.service';
import { SaveAsTemplateDialog } from './save-as-template-dialog';

@Component({
  selector: 'listryx-list-detail-page',
  imports: [
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    Button,
    Checkbox,
    InputText,
    InputNumber,
    Menu,
    ListryxEmptyState,
    SaveAsTemplateDialog,
  ],
  templateUrl: './list-detail-page.html',
})
export class ListDetailPage {
  readonly id = input.required<string>();

  private readonly service = inject(ListService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);
  protected readonly t = injectTranslate();
  protected readonly locale = currentLocale;
  protected readonly currency = currentCurrency;

  private readonly resource = this.service.detail(() => this.id());

  protected readonly list = computed<ListDetail | undefined>(() => this.resource.value());
  protected readonly isLoading = computed(() => this.resource.isLoading());

  protected readonly pending = computed(() =>
    (this.list()?.items ?? []).filter((item) => !item.checked),
  );
  protected readonly done = computed(() =>
    (this.list()?.items ?? []).filter((item) => item.checked),
  );

  protected readonly quickAdd = signal('');
  protected readonly expandedItem = signal<string | null>(null);
  protected readonly doneOpen = signal(false);
  protected readonly templateDialogOpen = signal(false);

  protected readonly menuItems = computed(() => {
    const list = this.list();

    return [
      {
        label: this.t('lists.saveAsTemplate'),
        icon: 'pi pi-clone',
        command: () => this.templateDialogOpen.set(true),
      },
      list?.status === 'open'
        ? { label: this.t('lists.close'), icon: 'pi pi-check', command: () => this.close() }
        : { label: this.t('lists.reopen'), icon: 'pi pi-undo', command: () => this.reopen() },
      {
        label: this.t('common.delete'),
        icon: 'pi pi-trash',
        command: () => this.remove(),
      },
    ];
  });

  protected money(value: string | null): string {
    return formatMoney(value);
  }

  protected quantity(value: string | null): string {
    return formatQuantity(value);
  }

  protected priceOf(item: ListItem): number | null {
    return toNumber(item.unitPrice);
  }

  protected quantityOf(item: ListItem): number | null {
    return toNumber(item.quantity);
  }

  protected add(): void {
    const text = this.quickAdd().trim();

    if (text === '') {
      return;
    }

    this.quickAdd.set('');
    this.service.addItem(this.id(), { text }).subscribe((list) => this.apply(list));
  }

  protected toggle(item: ListItem): void {
    this.service
      .updateItem(this.id(), item.id, { checked: !item.checked })
      .subscribe((list) => this.apply(list));
  }

  protected setPrice(item: ListItem, value: number | null): void {
    this.service
      .updateItem(this.id(), item.id, { unitPrice: toDecimalString(value) })
      .subscribe((list) => this.apply(list));
  }

  protected setQuantity(item: ListItem, value: number | null): void {
    this.service
      .updateItem(this.id(), item.id, { quantity: toDecimalString(value) })
      .subscribe((list) => this.apply(list));
  }

  protected rename(item: ListItem, text: string): void {
    const trimmed = text.trim();

    if (trimmed === '' || trimmed === item.text) {
      return;
    }

    this.service
      .updateItem(this.id(), item.id, { text: trimmed })
      .subscribe((list) => this.apply(list));
  }

  protected removeItem(item: ListItem): void {
    this.service.removeItem(this.id(), item.id).subscribe(() => this.resource.reload());
  }

  protected drop(event: CdkDragDrop<readonly ListItem[]>): void {
    const list = this.list();

    if (!list || event.previousIndex === event.currentIndex) {
      return;
    }

    const pending = [...this.pending()];
    moveItemInArray(pending, event.previousIndex, event.currentIndex);

    const items = [...pending, ...this.done()];

    this.apply({ ...list, items });

    this.service
      .reorderItems(
        this.id(),
        items.map((item) => item.id),
      )
      .subscribe({
        next: (updated) => this.apply(updated),
        error: () => this.apply(list),
      });
  }

  protected back(): void {
    void this.router.navigate(['/lists']);
  }

  protected expand(item: ListItem): void {
    this.expandedItem.update((current) => (current === item.id ? null : item.id));
  }

  private close(): void {
    this.service.close(this.id()).subscribe((list) => this.apply(list));
  }

  private reopen(): void {
    this.service.reopen(this.id()).subscribe((list) => this.apply(list));
  }

  private remove(): void {
    this.confirm.confirm({
      header: this.t('lists.deleteHeader'),
      message: this.t('lists.deleteMessage'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.remove(this.id()).subscribe(() => {
          void this.router.navigate(['/lists']);
        });
      },
    });
  }

  private apply(list: ListDetail): void {
    this.resource.set(list);
  }
}
