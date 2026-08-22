import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { Select } from 'primeng/select';

import { injectTranslate } from '../../core/i18n/translate';
import { ListryxCard } from '../../shared/ui/card';
import { ChartTheme, ListryxChart, baseScales } from '../../shared/ui/chart';
import { ListryxEmptyState } from '../../shared/ui/empty-state';
import { ListryxPageHeader } from '../../shared/ui/page-header';
import { formatDate } from '../../shared/util/date';
import { formatMoney } from '../../shared/util/money';
import { currentLocale } from '../../shared/util/locale';
import { InsightService } from './insight.service';

@Component({
  selector: 'listryx-insights-page',
  imports: [FormsModule, Select, ListryxCard, ListryxChart, ListryxPageHeader, ListryxEmptyState],
  templateUrl: './insights-page.html',
})
export class InsightsPage {
  protected readonly service = inject(InsightService);
  protected readonly itemOptions = computed(() => [...this.service.items()]);
  protected readonly t = injectTranslate();

  protected readonly prices = computed(() => this.service.prices());
  protected readonly totals = computed(() => this.service.totals());

  protected readonly hasPriceTrend = computed(() => this.prices().length >= 2);
  protected readonly hasTotalTrend = computed(() => this.totals().length >= 2);

  protected readonly priceChart = computed(() => {
    const points = this.prices();
    const label = this.service.selectedItem() ?? '';

    return (theme: ChartTheme): ChartConfiguration => ({
      type: 'line',
      data: {
        labels: points.map((point) => this.shortDate(point.at)),
        datasets: [
          {
            label,
            data: points.map((point) => Number(point.unitPrice)),
            borderColor: theme.series,
            backgroundColor: theme.series,
            borderWidth: 2,
            tension: 0,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderColor: theme.surface,
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => formatMoney(String(context.parsed.y)),
            },
          },
        },
        interaction: { mode: 'index', intersect: false },
        scales: baseScales(theme, (value) => formatMoney(String(value))),
      },
    });
  });

  protected readonly totalsChart = computed(() => {
    const points = this.totals();

    return (theme: ChartTheme): ChartConfiguration => ({
      type: 'bar',
      data: {
        labels: points.map((point) => this.shortDate(point.at)),
        datasets: [
          {
            label: this.t('insights.listTotal'),
            data: points.map((point) => Number(point.total)),
            backgroundColor: theme.series,
            borderRadius: 4,
            borderSkipped: 'bottom',
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => points[items[0]?.dataIndex ?? 0]?.name ?? '',
              label: (context) => formatMoney(String(context.parsed.y)),
            },
          },
        },
        scales: baseScales(theme, (value) => formatMoney(String(value))),
      },
    });
  });

  constructor() {
    // The service is a root singleton, so its resources outlive this page. Trends are derived
    // from item writes, and those deliberately never refetch, so entering the page is the only
    // thing that can refresh them. `reload()` no-ops while a resource is still loading, so the
    // first visit does not fetch twice.
    this.service.reload();
  }

  protected selectedText(): string {
    return this.service.selectedItem() ?? '';
  }

  protected money(value: string | null): string {
    return formatMoney(value);
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  private shortDate(at: string): string {
    return new Intl.DateTimeFormat(currentLocale(), { month: 'short', day: 'numeric' }).format(
      new Date(at),
    );
  }
}
