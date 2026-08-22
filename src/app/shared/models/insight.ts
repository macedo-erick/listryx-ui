import { IsoInstant, Uuid } from './common';

export interface PricedItem {
  readonly text: string;
  readonly observationCount: number;
  readonly latestPrice: string;
  readonly latestAt: IsoInstant;
}

export interface ItemPricePoint {
  readonly at: IsoInstant;
  readonly unitPrice: string;
  readonly listId: Uuid;
  readonly listName: string;
}

export interface ListTotalPoint {
  readonly listId: Uuid;
  readonly name: string;
  readonly at: IsoInstant;
  readonly total: string;
  readonly itemCount: number;
}
