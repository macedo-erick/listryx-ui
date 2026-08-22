import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ListryxEmptyState } from './empty-state';

describe('ListryxEmptyState', () => {
  let fixture: ComponentFixture<ListryxEmptyState>;

  function text() {
    return fixture.nativeElement.textContent.trim();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ListryxEmptyState);
    fixture.componentRef.setInput('title', 'No lists yet');
  });

  it('shows the title it was given', () => {
    fixture.detectChanges();

    expect(text()).toContain('No lists yet');
  });

  it('leaves out the message paragraph entirely when there is nothing to add', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('p')).toHaveLength(1);
  });

  it('shows the message under the title when one is given', () => {
    fixture.componentRef.setInput('message', 'Create one to get started');
    fixture.detectChanges();

    expect(text()).toContain('Create one to get started');
    expect(fixture.nativeElement.querySelectorAll('p')).toHaveLength(2);
  });

  it('hides its icon from assistive technology, because the title already says it', () => {
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i');

    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('falls back to the inbox icon rather than rendering no icon at all', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('i').className).toContain('pi-inbox');
  });

  it('takes the icon it was given', () => {
    fixture.componentRef.setInput('icon', 'pi-clone');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('i').className).toContain('pi-clone');
  });
});
