import { beforeEach, describe, expect, it } from 'vitest';

import { currentCurrency } from './currency';
import { currentLocale } from './locale';
import { currencySymbol, formatMoney, formatQuantity, toDecimalString, toNumber } from './money';

describe('money', () => {
  beforeEach(() => {
    currentLocale.set('en-US');
    currentCurrency.set('BRL');
  });

  it('formats a decimal string from the API without going through a float', () => {
    expect(formatMoney('19.99', 'USD')).toBe('$19.99');
    expect(formatMoney('0.10', 'USD')).toBe('$0.10');
  });

  it('renders nothing rather than a zero when there is no price', () => {
    expect(formatMoney(null)).toBe('');
    expect(formatMoney(undefined)).toBe('');
    expect(formatMoney('')).toBe('');
    expect(formatQuantity(null)).toBe('');
  });

  it('round-trips between the API string and a bound number input', () => {
    expect(toNumber('2.50')).toBe(2.5);
    expect(toDecimalString(2.5)).toBe('2.50');
    expect(toDecimalString(null)).toBeNull();
  });

  it('treats an unparseable value as absent rather than as NaN on screen', () => {
    expect(formatMoney('not a price')).toBe('');
    expect(toNumber('not a price')).toBeNull();
  });

  it('labels with the chosen currency rather than a compiled-in one', () => {
    expect(formatMoney('450.00')).toBe('R$450.00');

    currentCurrency.set('USD');

    expect(formatMoney('450.00')).toBe('$450.00');
  });

  it('keeps currency and language independent, because one is not a translation of the other', () => {
    currentLocale.set('pt-BR');

    expect(formatMoney('450.00')).toBe('R$\u00a0450,00');

    currentLocale.set('en-US');

    expect(formatMoney('450.00')).toBe('R$450.00');
  });

  it('reads the symbol for the chosen currency in the active language', () => {
    currentCurrency.set('USD');

    expect(currencySymbol()).toBe('$');

    currentLocale.set('pt-BR');

    expect(currencySymbol()).toBe('US$');
  });
});
