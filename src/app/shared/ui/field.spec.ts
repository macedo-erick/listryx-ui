import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ListryxField } from './field';

describe('ListryxField', () => {
  let fixture: ComponentFixture<ListryxField>;

  function paragraph() {
    return fixture.nativeElement.querySelector('p');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ListryxField);
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('inputId', 'list-name');
  });

  it('points its label at the control, which is what makes clicking it focus the input', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');

    expect(label.getAttribute('for')).toBe('list-name');
    expect(label.textContent.trim()).toBe('Name');
  });

  it('shows neither hint nor error when the field is simply blank', () => {
    fixture.detectChanges();

    expect(paragraph()).toBeNull();
  });

  it('shows the hint while the field is valid', () => {
    fixture.componentRef.setInput('hint', 'Shown on the lists page');
    fixture.detectChanges();

    expect(paragraph().textContent.trim()).toBe('Shown on the lists page');
  });

  it('replaces the hint with the error, so the two never compete for the same line', () => {
    fixture.componentRef.setInput('hint', 'Shown on the lists page');
    fixture.componentRef.setInput('error', 'Name is required');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('p')).toHaveLength(1);
    expect(paragraph().textContent.trim()).toBe('Name is required');
  });
});
