import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { Type } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { ListDetailPage } from './lists/list-detail-page';
import { TemplateFormDialog } from './templates/template-form-dialog';

interface Compiled {
  ɵcmp: { dependencies?: Type<unknown>[] | (() => Type<unknown>[]) };
}

function dependenciesOf(component: Type<unknown>): Type<unknown>[] {
  const dependencies = (component as unknown as Compiled).ɵcmp.dependencies;

  return typeof dependencies === 'function' ? dependencies() : (dependencies ?? []);
}

describe('drag handle wiring', () => {
  it.each([
    ['ListDetailPage', ListDetailPage as Type<unknown>],
    ['TemplateFormDialog', TemplateFormDialog as Type<unknown>],
  ])('%s imports CdkDragHandle so only the handle starts a drag', (_name, component) => {
    expect(dependenciesOf(component)).toContain(CdkDragHandle);
  });
});
