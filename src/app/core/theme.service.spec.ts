import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from './theme.service';

const STORAGE_KEY = 'listryx.theme';
const DARK_CLASS = 'app-dark';

// jsdom ships no matchMedia, so the system preference has to be installed rather than spied on.
function prefersDark(matches: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
}

function start(): ThemeService {
  const service = TestBed.inject(ThemeService);
  TestBed.tick();
  return service;
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(DARK_CLASS);
    prefersDark(false);
    TestBed.configureTestingModule({ providers: [ThemeService] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove(DARK_CLASS);
  });

  it('restores the theme the user chose last time', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');

    expect(start().isDark()).toBe(true);
  });

  it('follows the system preference when the user has never chosen', () => {
    prefersDark(true);

    expect(start().isDark()).toBe(true);
  });

  it('prefers an explicit light choice over a system that asks for dark', () => {
    prefersDark(true);
    localStorage.setItem(STORAGE_KEY, 'light');

    expect(start().isDark()).toBe(false);
  });

  it('ignores a stored value that is neither theme', () => {
    localStorage.setItem(STORAGE_KEY, 'neon');

    expect(start().isDark()).toBe(false);
  });

  it('puts the dark class on the document, because the theme is read from the root element', () => {
    const service = start();

    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false);

    service.toggle();
    TestBed.tick();

    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true);
  });

  it('writes the choice down so the next visit starts in the same theme', () => {
    const service = start();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');

    service.toggle();
    TestBed.tick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('toggles back and forth rather than only switching on', () => {
    const service = start();

    service.toggle();
    TestBed.tick();
    service.toggle();
    TestBed.tick();

    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false);
  });
});
