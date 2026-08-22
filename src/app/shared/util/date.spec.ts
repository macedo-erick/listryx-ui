import { beforeEach, describe, expect, it } from 'vitest';

import { formatDate } from './date';
import { currentLocale } from './locale';

describe('formatDate', () => {
  beforeEach(() => {
    currentLocale.set('en-US');
  });

  it('formats an API instant in the active language, not the compiled-in one', () => {
    expect(formatDate('2026-08-01T10:00:00+00:00')).toBe('Aug 1, 2026');

    currentLocale.set('pt-BR');

    expect(formatDate('2026-08-01T10:00:00+00:00')).toBe('1 de ago. de 2026');
  });

  it('renders nothing rather than a placeholder date when there is none', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('treats an unparseable value as absent rather than printing Invalid Date', () => {
    expect(formatDate('not a date')).toBe('');
    expect(formatDate('2026-13-45T99:00:00Z')).toBe('');
  });

  // A date-only string is read as UTC midnight and then rendered in the viewer's timezone, so it
  // can show the day before. Asserted against the same instant rather than a literal, which would
  // only pass in the timezone it was written in.
  it('reads a plain date as UTC midnight, which is not the same as the local day', () => {
    expect(formatDate('2026-12-25')).toBe(formatDate('2026-12-25T00:00:00+00:00'));
  });
});
