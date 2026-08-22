import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { ListDetail } from '../../shared/models';
import { ListService } from './list.service';

const LIST_ID = '3f1b8b8e-2b7a-4c65-9c2e-1f0f6a5d9b11';

function listDetail(overrides: Partial<ListDetail> = {}): ListDetail {
  return {
    id: LIST_ID,
    name: 'Saturday run',
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
    ...overrides,
  };
}

describe('ListService', () => {
  let service: ListService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ListService],
    });

    service = TestBed.inject(ListService);
    http = TestBed.inject(HttpTestingController);
  });

  it('sends the template id so the copy happens server-side in one call', () => {
    service.create({ name: 'Saturday run', templateId: 'tpl-1' }).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/lists`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Saturday run', templateId: 'tpl-1' });
    request.flush(listDetail());
  });

  it('sends the whole ordering rather than a moved pair', () => {
    service.reorderItems(LIST_ID, ['a', 'b', 'c']).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/lists/${LIST_ID}/items/order`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ itemIds: ['a', 'b', 'c'] });
    request.flush(listDetail());
  });

  it('clears a price with an explicit null, and leaves it alone otherwise', () => {
    service.updateItem(LIST_ID, 'item-1', { unitPrice: null }).subscribe();

    const cleared = http.expectOne(`${environment.apiUrl}/lists/${LIST_ID}/items/item-1`);

    expect(cleared.request.body).toEqual({ unitPrice: null });
    cleared.flush(listDetail());

    service.updateItem(LIST_ID, 'item-1', { checked: true }).subscribe();

    const checked = http.expectOne(`${environment.apiUrl}/lists/${LIST_ID}/items/item-1`);

    expect(checked.request.body).toEqual({ checked: true });
    expect('unitPrice' in (checked.request.body as object)).toBe(false);
    checked.flush(listDetail());
  });

  it('uses the status signal as the list filter', () => {
    TestBed.tick();
    const open = http.expectOne((request) => request.url === `${environment.apiUrl}/lists`);

    expect(open.request.params.get('status')).toBe('open');
    open.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    service.status.set('closed');
    TestBed.tick();

    const closed = http.expectOne((request) => request.url === `${environment.apiUrl}/lists`);

    expect(closed.request.params.get('status')).toBe('closed');
    closed.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
  });
});
