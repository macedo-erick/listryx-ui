import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { APP_CURRENCIES, CURRENCY_STORAGE_KEY, currentCurrency } from '../shared/util/currency';
import { currentLocale } from '../shared/util/locale';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  const original = currentCurrency();

  beforeEach(() => {
    localStorage.clear();
    currentLocale.set('en-US');
    TestBed.configureTestingModule({ providers: [CurrencyService] });
    service = TestBed.inject(CurrencyService);
    TestBed.tick();
  });

  afterEach(() => {
    currentCurrency.set(original);
    localStorage.clear();
  });

  it('offers exactly the currencies the app supports', () => {
    expect(service.available).toEqual(APP_CURRENCIES);
  });

  it('publishes the choice through the shared signal the formatters read', () => {
    service.set('USD');

    expect(currentCurrency()).toBe('USD');
    expect(service.currency()).toBe('USD');
  });

  it('writes the choice down so the next visit starts in the same currency', () => {
    service.set('USD');
    TestBed.tick();

    expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('USD');

    service.set('BRL');
    TestBed.tick();

    expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('BRL');
  });

  it('labels a currency with its symbol and its code, since the symbol alone is ambiguous', () => {
    expect(service.label('USD')).toBe('$ · USD');
    expect(service.label('BRL')).toBe('R$ · BRL');
  });

  it('labels in the active language, because the symbol is not the same everywhere', () => {
    currentLocale.set('pt-BR');

    expect(service.label('USD')).toBe('US$ · USD');
  });
});
