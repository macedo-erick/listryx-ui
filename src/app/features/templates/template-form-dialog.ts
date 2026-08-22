import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';

import { injectTranslate } from '../../core/i18n/translate';
import { TemplateSummary } from '../../shared/models';
import { currentLocale } from '../../shared/util/locale';
import { toDecimalString, toNumber } from '../../shared/util/money';
import { TemplateService } from './template.service';

interface EditableItem {
  text: string;
  defaultQuantity: number | null;
}

@Component({
  selector: 'listryx-template-form-dialog',
  imports: [
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    Dialog,
    Button,
    InputText,
    InputNumber,
  ],
  templateUrl: './template-form-dialog.html',
})
export class TemplateFormDialog {
  readonly visible = model(false);
  readonly template = input<TemplateSummary | null>(null);

  private readonly service = inject(TemplateService);
  protected readonly t = injectTranslate();
  protected readonly locale = currentLocale;

  protected readonly name = signal('');
  protected readonly items = signal<EditableItem[]>([]);
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.name().trim().length > 0 && !this.saving());

  constructor() {
    effect(() => {
      if (!this.visible()) {
        return;
      }

      const summary = this.template();

      if (summary === null) {
        this.name.set('');
        this.items.set([{ text: '', defaultQuantity: null }]);

        return;
      }

      this.name.set(summary.name);
      this.service.detail(summary.id).subscribe((detail) => {
        this.items.set(
          detail.items.map((item) => ({
            text: item.text,
            defaultQuantity: toNumber(item.defaultQuantity),
          })),
        );
      });
    });
  }

  protected setText(index: number, text: string): void {
    this.items.update((items) => items.map((item, i) => (i === index ? { ...item, text } : item)));
  }

  protected setQuantity(index: number, defaultQuantity: number | null): void {
    this.items.update((items) =>
      items.map((item, i) => (i === index ? { ...item, defaultQuantity } : item)),
    );
  }

  protected addRow(): void {
    this.items.update((items) => [...items, { text: '', defaultQuantity: null }]);
  }

  protected removeRow(index: number): void {
    this.items.update((items) => items.filter((_, i) => i !== index));
  }

  protected drop(event: CdkDragDrop<EditableItem[]>): void {
    this.items.update((items) => {
      const next = [...items];
      moveItemInArray(next, event.previousIndex, event.currentIndex);

      return next;
    });
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }

    this.saving.set(true);

    const request = {
      name: this.name().trim(),
      items: this.items()
        .filter((item) => item.text.trim() !== '')
        .map((item) => ({
          text: item.text.trim(),
          defaultQuantity: toDecimalString(item.defaultQuantity),
        })),
    };

    const summary = this.template();
    const call =
      summary === null ? this.service.create(request) : this.service.replace(summary.id, request);

    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.visible.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
