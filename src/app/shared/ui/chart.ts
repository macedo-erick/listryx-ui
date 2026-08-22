import { Component, ElementRef, effect, inject, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { ThemeService } from '../../core/theme.service';
import { currentCurrency } from '../util/currency';
import { currentLocale } from '../util/locale';

Chart.register(...registerables);

export interface ChartTheme {
  readonly series: string;
  readonly text: string;
  readonly muted: string;
  readonly grid: string;
  readonly surface: string;
}

const LIGHT: ChartTheme = {
  series: '#2a78d6',
  text: '#0b0b0b',
  muted: '#52514e',
  grid: 'rgba(11, 11, 11, 0.08)',
  surface: '#fcfcfb',
};

const DARK: ChartTheme = {
  series: '#3987e5',
  text: '#ffffff',
  muted: '#c3c2b7',
  grid: 'rgba(255, 255, 255, 0.12)',
  surface: '#1a1a19',
};

@Component({
  selector: 'listryx-chart',
  template: `<canvas #canvas [attr.aria-label]="label()" role="img"></canvas>`,
  styles: `
    :host {
      display: block;
      position: relative;
      height: 16rem;
    }
  `,
})
export class ListryxChart {
  readonly type = input.required<ChartType>();
  readonly label = input.required<string>();
  readonly build = input.required<(theme: ChartTheme) => ChartConfiguration>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly theme = inject(ThemeService);
  private chart?: Chart;

  constructor() {
    effect((onCleanup) => {
      const palette = this.theme.isDark() ? DARK : LIGHT;

      // Axis ticks are formatted by a callback Chart.js runs while painting, so a currency or
      // language change cannot re-render them the way it re-renders the DOM. Read both here to
      // rebuild the chart, exactly as a theme change does.
      currentCurrency();
      currentLocale();

      const config = this.build()(palette);

      this.chart?.destroy();
      this.chart = new Chart(this.canvas().nativeElement, config);

      onCleanup(() => {
        this.chart?.destroy();
        this.chart = undefined;
      });
    });
  }
}

export function baseScales(theme: ChartTheme, currencyTick: (value: number) => string) {
  return {
    x: {
      grid: { display: false },
      border: { color: theme.grid },
      ticks: { color: theme.muted, maxRotation: 0, autoSkipPadding: 16 },
    },
    y: {
      beginAtZero: true,
      grid: { color: theme.grid, drawTicks: false },
      border: { display: false },
      ticks: {
        color: theme.muted,
        callback: (value: string | number) => currencyTick(Number(value)),
      },
    },
  };
}
