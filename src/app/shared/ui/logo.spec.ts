import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ListryxLogo } from './logo';

function render(size?: string) {
  const fixture = TestBed.createComponent(ListryxLogo);

  if (size !== undefined) {
    fixture.componentRef.setInput('size', size);
  }

  fixture.detectChanges();

  return fixture.nativeElement.querySelector('svg') as SVGElement;
}

describe('ListryxLogo', () => {
  it('carries its own label, because the mark is the only thing naming it', () => {
    const svg = render();

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Listryx');
  });

  it('scales to the size it was given rather than to a fixed one', () => {
    expect(render('3rem').getAttribute('style')).toContain('3rem');
  });

  it('defaults to a size that suits a toolbar', () => {
    expect(render().getAttribute('style')).toContain('1.5rem');
  });

  // Two marks on one page would otherwise share a gradient id, and the second would go unpainted.
  it('gives every instance its own gradient id', () => {
    const first = render().querySelector('linearGradient')?.id;
    const second = render().querySelector('linearGradient')?.id;

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it('points the fill at its own gradient', () => {
    const svg = render();
    const id = svg.querySelector('linearGradient')?.id;

    expect(svg.querySelector('rect')?.getAttribute('fill')).toBe(`url(#${id})`);
  });
});
