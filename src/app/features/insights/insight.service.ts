import { httpResource } from '@angular/common/http';
import { Service, computed, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ItemPricePoint, ListTotalPoint, PricedItem } from '../../shared/models';

const BASE_URL = `${environment.apiUrl}/insights`;

@Service()
export class InsightService {
  readonly selectedItem = signal<string | null>(null);

  private readonly itemsResource = httpResource<PricedItem[]>(() => `${BASE_URL}/items`, {
    defaultValue: [],
  });

  private readonly pricesResource = httpResource<ItemPricePoint[]>(
    () => {
      const text = this.selectedItem();

      return text === null ? undefined : { url: `${BASE_URL}/item-prices`, params: { text } };
    },
    { defaultValue: [] },
  );

  private readonly totalsResource = httpResource<ListTotalPoint[]>(
    () => `${BASE_URL}/list-totals`,
    { defaultValue: [] },
  );

  readonly items = computed(() => this.itemsResource.value());
  readonly prices = computed(() => this.pricesResource.value());
  readonly totals = computed(() => this.totalsResource.value());
  readonly isLoading = computed(
    () => this.itemsResource.isLoading() || this.totalsResource.isLoading(),
  );

  reload(): void {
    this.itemsResource.reload();
    this.totalsResource.reload();
    this.pricesResource.reload();
  }
}
