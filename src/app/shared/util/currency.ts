import { signal } from '@angular/core';

import { environment } from '../../../environments/environment';

export type AppCurrency = 'BRL' | 'USD';

export const APP_CURRENCIES: readonly AppCurrency[] = ['BRL', 'USD'];

export const CURRENCY_STORAGE_KEY = 'listryx.currency';

/**
 * Deliberately independent of the locale: language is what you read, currency is what you spend.
 * Nothing here converts — the stored amounts are whatever you typed, so this only decides how
 * they are labelled.
 */
export const currentCurrency = signal<AppCurrency>(initialCurrency());

export function isAppCurrency(value: string | null | undefined): value is AppCurrency {
  return APP_CURRENCIES.includes(value as AppCurrency);
}

function initialCurrency(): AppCurrency {
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);

  if (isAppCurrency(stored)) {
    return stored;
  }

  return isAppCurrency(environment.defaultCurrency) ? environment.defaultCurrency : 'BRL';
}
