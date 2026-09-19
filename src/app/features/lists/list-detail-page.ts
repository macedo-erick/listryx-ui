import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
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
import { ListRenameDialog } from './list-rename-dialog';
import { ListService } from './list.service';
import { SaveAsTemplateDialog } from './save-as-template-dialog';

interface CategoryGroup {
  readonly key: string;
  readonly name: string | null;
  readonly items: readonly ListItem[];
  readonly expanded: boolean;
  readonly dropListId: string;
}

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
    ListRenameDialog,
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
  protected readonly renameDialogOpen = signal(false);
  protected readonly collapsedCategories = signal<ReadonlySet<string>>(new Set());

  private readonly quickAddInput = viewChild.required<ElementRef<HTMLInputElement>>(
    'quickAddInput',
  );

  protected readonly categoryGroups = computed<CategoryGroup[]>(() => {
    const map = new Map<string, ListItem[]>();
    const order: string[] = [];

    for (const item of this.pending()) {
      const key = item.category ?? '';
      const group = map.get(key);

      if (group === undefined) {
        map.set(key, [item]);
        order.push(key);
      } else {
        group.push(item);
      }
    }

    const uncategorizedIndex = order.indexOf('');

    if (uncategorizedIndex > 0) {
      order.splice(uncategorizedIndex, 1);
      order.unshift('');
    }

    const collapsed = this.collapsedCategories();

    return order.map((key) => ({
      key,
      name: key === '' ? null : key,
      items: map.get(key) ?? [],
      expanded: !collapsed.has(key),
      dropListId: `group-${key}`,
    }));
  });

  protected readonly groupDropListIds = computed(() =>
    this.categoryGroups().map((group) => group.dropListId),
  );

  protected readonly categorySuggestions = computed(() => {
    const seen = new Set<string>();
    const suggestions: string[] = [];

    for (const item of this.list()?.items ?? []) {
      if (item.category !== null && !seen.has(item.category)) {
        seen.add(item.category);
        suggestions.push(item.category);
      }
    }

    return suggestions;
  });

  protected readonly menuItems = computed(() => {
    const list = this.list();

    return [
      {
        label: this.t('lists.rename'),
        icon: 'pi pi-pencil',
        command: () => this.renameDialogOpen.set(true),
      },
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
    this.quickAddInput().nativeElement.focus();

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

  protected setCategory(item: ListItem, value: string): void {
    const trimmed = value.trim();
    const category = trimmed === '' ? null : trimmed;

    if (category === item.category) {
      return;
    }

    this.service.updateItem(this.id(), item.id, { category }).subscribe((list) => this.apply(list));
  }

  protected toggleCategory(key: string): void {
    this.collapsedCategories.update((collapsed) => {
      const next = new Set(collapsed);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
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

  protected drop(event: CdkDragDrop<CategoryGroup>): void {
    const list = this.list();

    if (!list) {
      return;
    }

    const sameGroup = event.previousContainer === event.container;

    if (sameGroup && event.previousIndex === event.currentIndex) {
      return;
    }

    const sourceKey = event.previousContainer.data.key;
    const targetKey = event.container.data.key;

    const sourceItems = [...event.previousContainer.data.items];
    const [moved] = sourceItems.splice(event.previousIndex, 1);

    const targetItems = sameGroup ? sourceItems : [...event.container.data.items];
    targetItems.splice(event.currentIndex, 0, moved);

    const pending = this.categoryGroups().flatMap((group) => {
      if (group.key === targetKey) {
        return targetItems;
      }
      if (group.key === sourceKey) {
        return sourceItems;
      }
      return group.items;
    });
    const items = [...pending, ...this.done()];

    this.apply({ ...list, items });

    const persist = () =>
      this.service
        .reorderItems(
          this.id(),
          items.map((item) => item.id),
        )
        .subscribe({
          next: (updated) => this.apply(updated),
          error: () => this.apply(list),
        });

    if (sameGroup) {
      persist();
      return;
    }

    this.service
      .updateItem(this.id(), moved.id, { category: targetKey === '' ? null : targetKey })
      .subscribe({
        next: persist,
        error: () => this.apply(list),
      });
  }

  protected back(): void {
    void this.router.navigate(['/lists']);
  }

  protected expand(item: ListItem): void {
    this.expandedItem.update((current) => (current === item.id ? null : item.id));
  }

  protected onRenamed(list: ListDetail): void {
    this.apply(list);
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
