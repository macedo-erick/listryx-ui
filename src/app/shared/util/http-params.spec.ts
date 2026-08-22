import { describe, expect, it } from 'vitest';

import { toHttpParams } from './http-params';

describe('toHttpParams', () => {
  it('drops the filters that are not set, so the API sees no filter at all', () => {
    const params = toHttpParams({ status: null, name: undefined, page: 0 });

    expect(params.has('status')).toBe(false);
    expect(params.has('name')).toBe(false);
    expect(params.get('page')).toBe('0');
  });

  it('treats an empty string as an unset filter rather than as a search for nothing', () => {
    expect(toHttpParams({ text: '' }).has('text')).toBe(false);
    expect(toHttpParams({ text: ' ' }).get('text')).toBe(' ');
  });

  it('keeps a zero and a false, which are values and not absences', () => {
    const params = toHttpParams({ size: 0, archived: false });

    expect(params.get('size')).toBe('0');
    expect(params.get('archived')).toBe('false');
  });

  it('serialises every value as a string, since that is all a query string carries', () => {
    const params = toHttpParams({ size: 100, archived: true, status: 'open' });

    expect(params.toString()).toBe('size=100&archived=true&status=open');
  });

  it('builds nothing out of an empty filter set', () => {
    expect(toHttpParams({}).keys()).toEqual([]);
  });
});
