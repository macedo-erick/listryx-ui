import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { provideTestingTransloco } from '../../../testing/transloco';
import { ListDetail, ListSummary, emptyPage } from '../../shared/models';
import { ListRenameDialog } from './list-rename-dialog';

const LIST_ID = '3f1b8b8e-2b7a-4c65-9c2e-1f0f6a5d9b11';

const RENAMED: ListDetail = {
  id: LIST_ID,
  name: 'Enxoval do bebê',
  status: 'open',
  templateId: null,
  createdAt: '2026-08-01T10:00:00+00:00',
  closedAt: null,
  itemCount: 0,
  checkedCount: 0,
  pricedItemCount: 0,
  total: null,
  checkedTotal: null,
  items: [],
};

describe('ListRenameDialog', () => {
  let fixture: ComponentFixture<ListRenameDialog>;
  let http: HttpTestingController;
  let dialog: { save(): void };

  function input(): HTMLInputElement {
    return document.querySelector('#renameListName')!;
  }

  function type(value: string): void {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [provideTestingTransloco()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ListRenameDialog);
    fixture.componentRef.setInput('listId', LIST_ID);
    fixture.componentRef.setInput('listName', 'Enxoval');
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    http
      .expectOne((request) => request.url === `${environment.apiUrl}/lists`)
      .flush(emptyPage<ListSummary>());

    dialog = fixture.componentInstance as unknown as typeof dialog;
  });

  it('opens seeded with the name the list already has', () => {
    expect(input().value).toBe('Enxoval');
  });

  it('emits the renamed list and closes once the patch lands', () => {
    let emitted: ListDetail | undefined;
    fixture.componentInstance.renamed.subscribe((list) => (emitted = list));

    type('  Enxoval do bebê  ');
    dialog.save();

    const request = http.expectOne(`${environment.apiUrl}/lists/${LIST_ID}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ name: 'Enxoval do bebê' });

    request.flush(RENAMED);

    expect(emitted).toEqual(RENAMED);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('closes without a request when the name is left untouched', () => {
    dialog.save();

    http.expectNone(`${environment.apiUrl}/lists/${LIST_ID}`);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('stays open when the rename fails, so the typed name is not lost', () => {
    type('Enxoval do bebê');
    dialog.save();

    http
      .expectOne(`${environment.apiUrl}/lists/${LIST_ID}`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(true);
    expect(input().value).toBe('Enxoval do bebê');
  });
});
