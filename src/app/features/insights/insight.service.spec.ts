import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { ItemPricePoint, ListTotalPoint, PricedItem } from '../../shared/models';
import { InsightService } from './insight.service';

const BASE_URL = `${environment.apiUrl}/insights`;

const ITEMS: PricedItem[] = [
  { text: 'Milk', observationCount: 4, latestPrice: '5.49', latestAt: '2026-08-01T10:00:00+00:00' },
];

const TOTALS: ListTotalPoint[] = [
  {
    listId: '1f0f6a5d-9b11-4c65-9c2e-3f1b8b8e2b7a',
    name: 'Saturday run',
    at: '2026-08-01T10:00:00+00:00',
    total: '182.30',
    itemCount: 12,
  },
];

const PRICES: ItemPricePoint[] = [
  {
    at: '2026-07-01T10:00:00+00:00',
    unitPrice: '4.99',
    listId: '1f0f6a5d-9b11-4c65-9c2e-3f1b8b8e2b7a',
    listName: 'Saturday run',
  },
];

describe('InsightService', () => {
  let service: InsightService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), InsightService],
    });

    service = TestBed.inject(InsightService);
    http = TestBed.inject(HttpTestingController);
  });

  // Resource values land a task later, so waiting on a macrotask is what makes them observable.
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();
  }

  async function loadOverview() {
    TestBed.tick();
    http.expectOne(`${BASE_URL}/items`).flush(ITEMS);
    http.expectOne(`${BASE_URL}/list-totals`).flush(TOTALS);
    await settle();
  }

  it('loads the two charts that need no selection as soon as the page opens', async () => {
    await settle();

    expect(http.expectOne(`${BASE_URL}/items`).request.method).toBe('GET');
    expect(http.expectOne(`${BASE_URL}/list-totals`).request.method).toBe('GET');

    http.expectNone((request) => request.url === `${BASE_URL}/item-prices`);
  });

  it('asks for no price history until an item is picked, since there is nothing to plot yet', async () => {
    await loadOverview();

    http.expectNone((request) => request.url === `${BASE_URL}/item-prices`);
    expect(service.prices()).toEqual([]);
  });

  it('fetches the price history for the picked item, passing it as a query rather than a path', async () => {
    await loadOverview();

    service.selectedItem.set('Milk');
    await settle();

    const request = http.expectOne((candidate) => candidate.url === `${BASE_URL}/item-prices`);

    expect(request.request.params.get('text')).toBe('Milk');
    request.flush(PRICES);
    await settle();

    expect(service.prices()).toEqual(PRICES);
  });

  it('refetches when the picked item changes, so one chart never shows another item history', async () => {
    await loadOverview();

    service.selectedItem.set('Milk');
    await settle();
    http.expectOne((candidate) => candidate.url === `${BASE_URL}/item-prices`).flush(PRICES);
    await settle();

    service.selectedItem.set('Bread');
    await settle();

    const second = http.expectOne((candidate) => candidate.url === `${BASE_URL}/item-prices`);

    expect(second.request.params.get('text')).toBe('Bread');
    second.flush([]);
    await settle();

    expect(service.prices()).toEqual([]);
  });

  it('starts every chart empty, so the page renders before any response arrives', async () => {
    expect(service.items()).toEqual([]);
    expect(service.totals()).toEqual([]);
    expect(service.prices()).toEqual([]);
    expect(service.selectedItem()).toBeNull();
  });

  it('exposes what arrived once the overview responds', async () => {
    await loadOverview();

    expect(service.items()).toEqual(ITEMS);
    expect(service.totals()).toEqual(TOTALS);
  });

  it('reports loading only for the charts the page waits on', async () => {
    await settle();

    expect(service.isLoading()).toBe(true);

    http.expectOne(`${BASE_URL}/items`).flush(ITEMS);
    http.expectOne(`${BASE_URL}/list-totals`).flush(TOTALS);
    await settle();

    expect(service.isLoading()).toBe(false);
  });

  it('reloads every chart at once, because they share one refresh control', async () => {
    await loadOverview();

    service.selectedItem.set('Milk');
    await settle();
    http.expectOne((candidate) => candidate.url === `${BASE_URL}/item-prices`).flush(PRICES);
    await settle();

    service.reload();
    await settle();

    http.expectOne(`${BASE_URL}/items`).flush(ITEMS);
    http.expectOne(`${BASE_URL}/list-totals`).flush(TOTALS);
    http.expectOne((candidate) => candidate.url === `${BASE_URL}/item-prices`).flush(PRICES);
  });
});
