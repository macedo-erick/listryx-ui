import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';

import { injectTranslate } from '../../core/i18n/translate';
import { ListDetail } from '../../shared/models';
import { ListService } from './list.service';

@Component({
  selector: 'listryx-list-rename-dialog',
  imports: [FormsModule, Dialog, Button, InputText],
  templateUrl: './list-rename-dialog.html',
})
export class ListRenameDialog {
  readonly visible = model(false);
  readonly listId = input.required<string>();
  readonly listName = input.required<string>();
  readonly renamed = output<ListDetail>();

  private readonly lists = inject(ListService);
  protected readonly t = injectTranslate();

  protected readonly name = signal('');
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.name().trim().length > 0 && !this.saving());

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.name.set(this.listName());
      }
    });
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }

    const name = this.name().trim();

    if (name === this.listName()) {
      this.visible.set(false);

      return;
    }

    this.saving.set(true);

    this.lists.rename(this.listId(), name).subscribe({
      next: (list) => {
        this.saving.set(false);
        this.visible.set(false);
        this.renamed.emit(list);
      },
      error: () => this.saving.set(false),
    });
  }
}
