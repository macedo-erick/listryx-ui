import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';

import { injectTranslate } from '../../core/i18n/translate';
import { TemplateSummary } from '../../shared/models';
import { ListryxCard } from '../../shared/ui/card';
import { ListryxEmptyState } from '../../shared/ui/empty-state';
import { ListryxPageHeader } from '../../shared/ui/page-header';
import { TemplateFormDialog } from './template-form-dialog';
import { TemplateService } from './template.service';

@Component({
  selector: 'listryx-templates-page',
  imports: [Button, ListryxCard, ListryxPageHeader, ListryxEmptyState, TemplateFormDialog],
  templateUrl: './templates-page.html',
})
export class TemplatesPage {
  protected readonly service = inject(TemplateService);
  private readonly confirm = inject(ConfirmationService);
  protected readonly t = injectTranslate();

  protected readonly dialogOpen = signal(false);
  protected readonly selected = signal<TemplateSummary | null>(null);
  protected readonly templates = computed(() => this.service.templates());

  protected openCreate(): void {
    this.selected.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(template: TemplateSummary): void {
    this.selected.set(template);
    this.dialogOpen.set(true);
  }

  protected remove(template: TemplateSummary): void {
    this.confirm.confirm({
      header: this.t('templates.deleteHeader'),
      message: this.t('templates.deleteMessage', { name: template.name }),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.remove(template.id).subscribe();
      },
    });
  }
}
