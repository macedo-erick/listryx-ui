import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { PageResponse, TemplateDetail, TemplateSummary } from '../../shared/models';
import { TemplateService } from './template.service';

const BASE_URL = `${environment.apiUrl}/templates`;
const LIST_URL = `${BASE_URL}?size=100`;
const TEMPLATE_ID = '9a3f6d21-4c8b-4f0e-9d1a-7b2c5e8f0a34';

function summary(overrides: Partial<TemplateSummary> = {}): TemplateSummary {
  return {
    id: TEMPLATE_ID,
    name: 'Weekly groceries',
    createdAt: '2026-08-01T10:00:00+00:00',
    itemCount: 3,
    ...overrides,
  };
}

function page(content: readonly TemplateSummary[]): PageResponse<TemplateSummary> {
  return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1 };
}

function detail(): TemplateDetail {
  return { ...summary(), items: [] };
}

describe('TemplateService', () => {
  let service: TemplateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TemplateService],
    });

    service = TestBed.inject(TemplateService);
    http = TestBed.inject(HttpTestingController);
  });

  // Resource values land a task later, and a reload issues its request the same way, so waiting
  // on a macrotask is what makes both observable. Full stability would deadlock: the app stays
  // unstable until the very request the test is about to expect has been flushed.
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();
  }

  async function loadList(content: readonly TemplateSummary[] = []) {
    TestBed.tick();
    http.expectOne(LIST_URL).flush(page(content));
    await settle();
  }

  it('asks for one large page, because the picker shows every template at once', async () => {
    TestBed.tick();

    const request = http.expectOne(LIST_URL);

    expect(request.request.method).toBe('GET');
    request.flush(page([]));
    await settle();
  });

  it('exposes the page content rather than the page envelope', async () => {
    await loadList([summary(), summary({ id: 'other', name: 'Party' })]);

    expect(service.templates().map((template) => template.name)).toEqual([
      'Weekly groceries',
      'Party',
    ]);
  });

  it('shows an empty list before the first response instead of failing on undefined', () => {
    expect(service.templates()).toEqual([]);
  });

  it('refetches the list after a create, so the new template shows without a manual reload', async () => {
    await loadList();

    service.create({ name: 'Weekly groceries', items: [] }).subscribe();

    const created = http.expectOne(BASE_URL);

    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({ name: 'Weekly groceries', items: [] });
    created.flush(detail());
    await settle();

    http.expectOne(LIST_URL).flush(page([summary()]));
    await settle();

    expect(service.templates()).toHaveLength(1);
  });

  it('replaces a template wholesale, because editing one is not a partial update', async () => {
    await loadList();

    service.replace(TEMPLATE_ID, { name: 'Renamed', items: [] }).subscribe();

    const replaced = http.expectOne(`${BASE_URL}/${TEMPLATE_ID}`);

    expect(replaced.request.method).toBe('PUT');
    expect(replaced.request.body).toEqual({ name: 'Renamed', items: [] });
    replaced.flush(detail());
    await settle();

    http.expectOne(LIST_URL).flush(page([]));
    await settle();
  });

  it('refetches after a delete, so the removed template leaves the list', async () => {
    await loadList([summary()]);

    service.remove(TEMPLATE_ID).subscribe();

    const removed = http.expectOne(`${BASE_URL}/${TEMPLATE_ID}`);

    expect(removed.request.method).toBe('DELETE');
    removed.flush(null);
    await settle();

    http.expectOne(LIST_URL).flush(page([]));
    await settle();

    expect(service.templates()).toEqual([]);
  });

  it('fetches a single template on demand rather than keeping every one in memory', async () => {
    await loadList();

    service.detail(TEMPLATE_ID).subscribe();

    const request = http.expectOne(`${BASE_URL}/${TEMPLATE_ID}`);

    expect(request.request.method).toBe('GET');
    request.flush(detail());
  });

  it('leaves the cached list alone when only one template was fetched', async () => {
    await loadList([summary()]);

    service.detail(TEMPLATE_ID).subscribe();
    http.expectOne(`${BASE_URL}/${TEMPLATE_ID}`).flush(detail());
    await settle();

    expect(service.templates()).toHaveLength(1);
  });
});
