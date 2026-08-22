import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

import { injectTranslate } from '../../core/i18n/translate';
import { TemplateService } from '../templates/template.service';
import { ListService } from './list.service';

@Component({
  selector: 'listryx-save-as-template-dialog',
  imports: [FormsModule, Dialog, Button, InputText, Select],
  templateUrl: './save-as-template-dialog.html',
})
export class SaveAsTemplateDialog {
  readonly visible = model(false);
  readonly listId = input.required<string>();
  readonly listName = input.required<string>();

  private readonly lists = inject(ListService);
  private readonly messages = inject(MessageService);
  protected readonly templates = inject(TemplateService);
  protected readonly templateOptions = computed(() => [...this.templates.templates()]);
  protected readonly t = injectTranslate();

  protected readonly name = signal('');
  protected readonly templateId = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.name().trim().length > 0 && !this.saving());

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.name.set(this.listName());
        this.templateId.set(null);
      }
    });
  }

  protected pickTemplate(id: string | null): void {
    this.templateId.set(id);

    const template = this.templates.templates().find((candidate) => candidate.id === id);

    if (template) {
      this.name.set(template.name);
    }
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }

    this.saving.set(true);

    this.lists
      .saveAsTemplate(this.listId(), {
        name: this.name().trim(),
        templateId: this.templateId() ?? undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.visible.set(false);
          this.templates.reload();
          this.messages.add({ severity: 'success', summary: this.t('lists.templateSaved') });
        },
        error: () => this.saving.set(false),
      });
  }
}
