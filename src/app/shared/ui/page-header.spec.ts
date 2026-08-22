import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ListryxPageHeader } from './page-header';

describe('ListryxPageHeader', () => {
  let fixture: ComponentFixture<ListryxPageHeader>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListryxPageHeader);
    fixture.componentRef.setInput('title', 'Lists');
  });

  it('renders the title as the one first-level heading on the page', () => {
    fixture.detectChanges();

    const headings = fixture.nativeElement.querySelectorAll('h1');

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent.trim()).toBe('Lists');
  });

  it('leaves out the subtitle paragraph when there is no subtitle', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });

  it('shows the subtitle beneath the heading when one is given', () => {
    fixture.componentRef.setInput('subtitle', 'Everything you are shopping for');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p').textContent.trim()).toBe(
      'Everything you are shopping for',
    );
  });
});
