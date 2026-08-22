import { IsoInstant } from '../models/common';
import { currentLocale } from './locale';

/**
 * Angular's `DatePipe` reads the static `LOCALE_ID`, which cannot follow a language switch made
 * at runtime, so dates go through `Intl` and `currentLocale()` like money and quantities do.
 */
export function formatDate(value: IsoInstant | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toLocaleDateString(currentLocale(), { dateStyle: 'medium' });
}
