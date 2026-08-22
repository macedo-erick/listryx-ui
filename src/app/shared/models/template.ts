import { IsoInstant, Uuid } from './common';

export interface TemplateItem {
  readonly id: Uuid;
  readonly text: string;
  readonly defaultQuantity: string | null;
  readonly sortOrder: number;
}

export interface TemplateSummary {
  readonly id: Uuid;
  readonly name: string;
  readonly createdAt: IsoInstant;
  readonly itemCount: number;
}

export interface TemplateDetail extends TemplateSummary {
  readonly items: readonly TemplateItem[];
}

export interface UpsertTemplateRequest {
  readonly name: string;
  readonly items: readonly { text: string; defaultQuantity?: string | null }[];
}
