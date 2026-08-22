import { IsoInstant, Uuid } from './common';

export type ListStatus = 'open' | 'closed';

export interface ListItem {
  readonly id: Uuid;
  readonly text: string;
  readonly quantity: string | null;
  readonly unitPrice: string | null;
  readonly subtotal: string | null;
  readonly checked: boolean;
  readonly sortOrder: number;
}

export interface ListSummary {
  readonly id: Uuid;
  readonly name: string;
  readonly status: ListStatus;
  readonly templateId: Uuid | null;
  readonly createdAt: IsoInstant;
  readonly closedAt: IsoInstant | null;
  readonly itemCount: number;
  readonly checkedCount: number;
  readonly pricedItemCount: number;
  readonly total: string | null;
  readonly checkedTotal: string | null;
}

export interface ListDetail extends ListSummary {
  readonly items: readonly ListItem[];
}

export interface CreateListRequest {
  readonly name: string;
  readonly templateId?: Uuid;
}

export interface CreateItemRequest {
  readonly text: string;
  readonly quantity?: string | null;
  readonly unitPrice?: string | null;
}

export interface UpdateItemRequest {
  readonly text?: string;
  readonly quantity?: string | null;
  readonly unitPrice?: string | null;
  readonly checked?: boolean;
}

export interface SaveAsTemplateRequest {
  readonly name: string;
  readonly templateId?: Uuid;
}
