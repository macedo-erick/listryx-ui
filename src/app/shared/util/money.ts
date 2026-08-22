import { currentCurrency } from './currency';
import { currentLocale } from './locale';

export function formatMoney(
  value: string | null | undefined,
  currency = currentCurrency(),
): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return '';
  }

  return new Intl.NumberFormat(currentLocale(), { style: 'currency', currency }).format(parsed);
}

export function currencySymbol(currency = currentCurrency()): string {
  return (
    new Intl.NumberFormat(currentLocale(), { style: 'currency', currency })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency
  );
}

export function formatQuantity(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? '' : new Intl.NumberFormat(currentLocale()).format(parsed);
}

/** The API takes decimal strings; a bound number input gives us a number or null. */
export function toDecimalString(value: number | null | undefined): string | null {
  return value === null || value === undefined || Number.isNaN(value) ? null : value.toFixed(2);
}

export function toNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}
