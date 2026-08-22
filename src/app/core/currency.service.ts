import { Service, effect } from '@angular/core';

import {
  APP_CURRENCIES,
  AppCurrency,
  CURRENCY_STORAGE_KEY,
  currentCurrency,
} from '../shared/util/currency';
import { currencySymbol } from '../shared/util/money';

@Service()
export class CurrencyService {
  readonly currency = currentCurrency;

  readonly available = APP_CURRENCIES;

  constructor() {
    effect(() => {
      localStorage.setItem(CURRENCY_STORAGE_KEY, this.currency());
    });
  }

  set(currency: AppCurrency): void {
    currentCurrency.set(currency);
  }

  label(currency: AppCurrency): string {
    return `${currencySymbol(currency)} · ${currency}`;
  }
}
