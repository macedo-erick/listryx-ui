import { Component, computed, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';

import { injectTranslate } from '../../core/i18n/translate';
import { TemplateSummary } from '../../shared/models';
import { TemplateService } from '../templates/template.service';
import { ListService } from './list.service';

type Source = 'scratch' | 'template';

@Component({
  selector: 'listryx-list-form-dialog',
  imports: [FormsModule, Dialog, Button, InputText, Select, SelectButton],
  templateUrl: './list-form-dialog.html',
})
export class ListFormDialog {
  readonly visible = model(false);
  readonly created = output<string>();

  private readonly lists = inject(ListService);
  protected readonly templates = inject(TemplateService);
  protected readonly templateOptions = computed(() => [...this.templates.templates()]);
  protected readonly t = injectTranslate();

  protected readonly name = signal('');
  protected readonly source = signal<Source>('scratch');
  protected readonly templateId = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly sourceOptions = computed(() => [
    { label: this.t('lists.fromScratch'), value: 'scratch' as Source },
    { label: this.t('lists.fromTemplate'), value: 'template' as Source },
  ]);

  protected readonly selectedTemplate = computed<TemplateSummary | undefined>(() =>
    this.templates.templates().find((template) => template.id === this.templateId()),
  );

  protected readonly canSave = computed(
    () =>
      this.name().trim().length > 0 &&
      (this.source() === 'scratch' || this.templateId() !== null) &&
      !this.saving(),
  );

  protected onShow(): void {
    this.name.set('');
    this.source.set('scratch');
    this.templateId.set(null);
  }

  protected pickTemplate(id: string | null): void {
    this.templateId.set(id);

    const template = this.templates.templates().find((candidate) => candidate.id === id);

    if (template && this.name().trim() === '') {
      this.name.set(template.name);
    }
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }

    this.saving.set(true);

    const templateId = this.source() === 'template' ? (this.templateId() ?? undefined) : undefined;

    this.lists.create({ name: this.name().trim(), templateId }).subscribe({
      next: (list) => {
        this.saving.set(false);
        this.visible.set(false);
        this.created.emit(list.id);
      },
      error: () => this.saving.set(false),
    });
  }
}
