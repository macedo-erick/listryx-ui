import { Component, input } from '@angular/core';

/** The Listryx mark — the same rounded square and checklist as `public/favicon.svg`. */
@Component({
  selector: 'listryx-logo',
  template: `
    <svg viewBox="0 0 1024 1024" role="img" aria-label="Listryx" [style.width]="size()">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#34d399" />
          <stop offset="1" stop-color="#059669" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="230" [attr.fill]="'url(#' + gradientId + ')'" />
      <g fill="none" stroke="#fff" stroke-width="72" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="212,338 268,394 360,274" />
        <polyline points="212,514 268,570 360,450" />
      </g>
      <rect
        x="208"
        y="614"
        width="152"
        height="152"
        rx="48"
        fill="none"
        stroke="#fff"
        stroke-width="46"
      />
      <g fill="#fff">
        <rect x="436" y="300" width="386" height="72" rx="36" />
        <rect x="436" y="476" width="386" height="72" rx="36" />
        <rect x="436" y="652" width="386" height="72" rx="36" />
      </g>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    svg {
      aspect-ratio: 1;
    }
  `,
})
export class ListryxLogo {
  readonly size = input('1.5rem');

  protected readonly gradientId = `listryx-logo-${++instances}`;
}

let instances = 0;
