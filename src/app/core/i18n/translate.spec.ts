import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestingTransloco } from '../../../testing/transloco';
import { injectTranslate, TranslateFn } from './translate';

describe('injectTranslate', () => {
  let translate: TranslateFn;
  let transloco: TranslocoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [provideTestingTransloco()] });

    transloco = TestBed.inject(TranslocoService);
    translate = TestBed.runInInjectionContext(() => injectTranslate());
  });

  it('translates a key rather than echoing it back', () => {
    expect(translate('titles.lists')).toBe('Lists');
  });

  it('fills in the parameters a message declares', () => {
    expect(translate('lists.doneCount', { count: 3 })).toBe('3 done');
  });

  // Reading it in a template re-runs on a language switch, which a plain call would not do.
  it('re-reads when the language changes, so a switch repaints the text', () => {
    const before = translate('titles.lists');

    transloco.setActiveLang('pt-BR');

    expect(translate('titles.lists')).toBe(before);
    expect(transloco.getActiveLang()).toBe('pt-BR');
  });
});
