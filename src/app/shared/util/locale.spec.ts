import { afterEach, describe, expect, it } from 'vitest';

import { APP_LOCALES, currentLocale, isAppLocale, LOCALE_STORAGE_KEY } from './locale';

describe('isAppLocale', () => {
  it('accepts only the locales the app actually ships', () => {
    expect(APP_LOCALES.every(isAppLocale)).toBe(true);
    expect(isAppLocale('fr-FR')).toBe(false);
    expect(isAppLocale('en')).toBe(false);
    expect(isAppLocale('pt-br')).toBe(false);
  });

  it('rejects an absent value, so a missing preference is never treated as a locale', () => {
    expect(isAppLocale(null)).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
    expect(isAppLocale('')).toBe(false);
  });

  it('narrows a stored string, which is how a saved preference is read back', () => {
    const stored: readonly (string | null)[] = ['en-US', 'klingon', null, 'pt-BR'];

    expect(stored.filter(isAppLocale)).toEqual(['en-US', 'pt-BR']);
  });
});

describe('currentLocale', () => {
  const original = currentLocale();

  afterEach(() => {
    currentLocale.set(original);
  });

  it('starts on a supported locale whatever the browser and storage asked for', () => {
    expect(isAppLocale(currentLocale())).toBe(true);
  });

  it('is the single place a language switch is published from', () => {
    currentLocale.set('pt-BR');

    expect(currentLocale()).toBe('pt-BR');

    currentLocale.set('en-US');

    expect(currentLocale()).toBe('en-US');
  });

  it('keeps its storage key stable, because renaming it drops the saved preference', () => {
    expect(LOCALE_STORAGE_KEY).toBe('listryx.locale');
  });
});
