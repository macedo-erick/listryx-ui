import { afterEach, describe, expect, it } from 'vitest';

import { APP_CURRENCIES, CURRENCY_STORAGE_KEY, currentCurrency, isAppCurrency } from './currency';

describe('isAppCurrency', () => {
  it('accepts only the currencies the app actually offers', () => {
    expect(APP_CURRENCIES.every(isAppCurrency)).toBe(true);
    expect(isAppCurrency('EUR')).toBe(false);
    expect(isAppCurrency('brl')).toBe(false);
  });

  it('rejects an absent value, so a missing preference is never treated as a currency', () => {
    expect(isAppCurrency(null)).toBe(false);
    expect(isAppCurrency(undefined)).toBe(false);
    expect(isAppCurrency('')).toBe(false);
  });

  it('narrows a stored string, which is how a saved preference is read back', () => {
    const stored: readonly (string | null)[] = ['USD', 'EUR', null, 'BRL'];

    expect(stored.filter(isAppCurrency)).toEqual(['USD', 'BRL']);
  });
});

describe('currentCurrency', () => {
  const original = currentCurrency();

  afterEach(() => {
    currentCurrency.set(original);
  });

  it('starts on a currency the app offers whatever storage asked for', () => {
    expect(isAppCurrency(currentCurrency())).toBe(true);
  });

  it('is the single place a currency switch is published from', () => {
    currentCurrency.set('USD');

    expect(currentCurrency()).toBe('USD');

    currentCurrency.set('BRL');

    expect(currentCurrency()).toBe('BRL');
  });

  it('keeps its storage key stable, because renaming it drops the saved preference', () => {
    expect(CURRENCY_STORAGE_KEY).toBe('listryx.currency');
  });
});
