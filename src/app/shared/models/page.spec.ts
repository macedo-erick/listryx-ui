import { describe, expect, it } from 'vitest';

import { emptyPage } from './page';
import { ListSummary } from './list';

describe('emptyPage', () => {
  it('stands in for a page that has not arrived, so a list renders before its first response', () => {
    const page = emptyPage<ListSummary>();

    expect(page.content).toEqual([]);
    expect(page.totalElements).toBe(0);
    expect(page.totalPages).toBe(0);
    expect(page.page).toBe(0);
  });

  it('carries the page size the caller will actually request', () => {
    expect(emptyPage(100).size).toBe(100);
  });

  it('defaults to the API page size rather than to zero, which would mean no rows at all', () => {
    expect(emptyPage().size).toBe(25);
  });

  it('builds a fresh page each time, so one caller cannot mutate another default', () => {
    expect(emptyPage()).not.toBe(emptyPage());
    expect(emptyPage().content).not.toBe(emptyPage().content);
  });
});
