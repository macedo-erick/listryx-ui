import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { provideTestingTransloco } from '../../../testing/transloco';
import { ListDetail, ListItem, ListSummary, emptyPage } from '../../shared/models';
import { ListDetailPage } from './list-detail-page';

const LIST_ID = '3f1b8b8e-2b7a-4c65-9c2e-1f0f6a5d9b11';

function item(id: string, text: string, sortOrder: number): ListItem {
  return {
    id,
    text,
    quantity: null,
    unitPrice: null,
    subtotal: null,
    checked: false,
    sortOrder,
  };
}

function detail(items: readonly ListItem[]): ListDetail {
  return {
    id: LIST_ID,
    name: 'Enxoval',
    status: 'open',
    templateId: null,
    createdAt: '2026-08-01T10:00:00+00:00',
    closedAt: null,
    itemCount: items.length,
    checkedCount: 0,
    pricedItemCount: 0,
    total: null,
    checkedTotal: null,
    items,
  };
}

const MEIAS = item('11111111-1111-4111-8111-111111111111', 'Meias', 0);
const TOUCAS = item('22222222-2222-4222-8222-222222222222', 'Toucas', 1);

describe('ListDetailPage reordering', () => {
  let fixture: ComponentFixture<ListDetailPage>;
  let http: HttpTestingController;

  function renderedOrder(): string[] {
    return [...fixture.nativeElement.querySelectorAll('li span.truncate')].map((el) =>
      (el as HTMLElement).textContent!.trim(),
    );
  }

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  function reorder(): void {
    (fixture.componentInstance as unknown as { drop(event: unknown): void }).drop({
      previousIndex: 1,
      currentIndex: 0,
    });
    fixture.detectChanges();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [provideTestingTransloco()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ConfirmationService,
        MessageService,
      ],
    });

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ListDetailPage);
    fixture.componentRef.setInput('id', LIST_ID);
    fixture.detectChanges();

    http
      .expectOne((request) => request.url === `${environment.apiUrl}/lists`)
      .flush(emptyPage<ListSummary>());
    http.expectOne(`${environment.apiUrl}/lists/${LIST_ID}`).flush(detail([MEIAS, TOUCAS]));

    await settle();
  });

  it('renders the order the server gave it', () => {
    expect(renderedOrder()).toEqual(['Meias', 'Toucas']);
  });

  it('shows the new order immediately, without waiting for the server', () => {
    reorder();

    expect(renderedOrder()).toEqual(['Toucas', 'Meias']);
  });

  it('sends the reordered ids to the server', () => {
    reorder();

    const request = http.expectOne(`${environment.apiUrl}/lists/${LIST_ID}/items/order`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ itemIds: [TOUCAS.id, MEIAS.id] });
  });

  it('keeps the order the server confirms', async () => {
    reorder();

    http
      .expectOne(`${environment.apiUrl}/lists/${LIST_ID}/items/order`)
      .flush(detail([TOUCAS, MEIAS]));
    await settle();

    expect(renderedOrder()).toEqual(['Toucas', 'Meias']);
  });

  it('puts the item back where it was when the server rejects the move', async () => {
    reorder();

    http
      .expectOne(`${environment.apiUrl}/lists/${LIST_ID}/items/order`)
      .flush('nope', { status: 500, statusText: 'Server Error' });
    await settle();

    expect(renderedOrder()).toEqual(['Meias', 'Toucas']);
  });
});
