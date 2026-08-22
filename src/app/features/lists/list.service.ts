import { HttpClient, httpResource } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateItemRequest,
  CreateListRequest,
  ListDetail,
  ListStatus,
  ListSummary,
  PageResponse,
  SaveAsTemplateRequest,
  UpdateItemRequest,
  Uuid,
  emptyPage,
} from '../../shared/models';
import { toHttpParams } from '../../shared/util/http-params';

const BASE_URL = `${environment.apiUrl}/lists`;

@Service()
export class ListService {
  private readonly http = inject(HttpClient);

  readonly status = signal<ListStatus | null>('open');

  private readonly page = httpResource<PageResponse<ListSummary>>(
    () => ({ url: BASE_URL, params: toHttpParams({ status: this.status(), size: 100 }) }),
    { defaultValue: emptyPage<ListSummary>() },
  );

  readonly lists = computed(() => this.page.value().content);
  readonly isLoading = computed(() => this.page.isLoading());
  readonly hasError = computed(() => this.page.error() !== undefined);

  reload(): void {
    this.page.reload();
  }

  detail(id: () => Uuid | null) {
    return httpResource<ListDetail>(() => {
      const listId = id();

      return listId === null ? undefined : `${BASE_URL}/${listId}`;
    });
  }

  create(request: CreateListRequest): Observable<ListDetail> {
    return this.http.post<ListDetail>(BASE_URL, request).pipe(tap(() => this.reload()));
  }

  rename(id: Uuid, name: string): Observable<ListDetail> {
    return this.http
      .patch<ListDetail>(`${BASE_URL}/${id}`, { name })
      .pipe(tap(() => this.reload()));
  }

  close(id: Uuid): Observable<ListDetail> {
    return this.http.post<ListDetail>(`${BASE_URL}/${id}/close`, {}).pipe(tap(() => this.reload()));
  }

  reopen(id: Uuid): Observable<ListDetail> {
    return this.http
      .post<ListDetail>(`${BASE_URL}/${id}/reopen`, {})
      .pipe(tap(() => this.reload()));
  }

  remove(id: Uuid): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`).pipe(tap(() => this.reload()));
  }

  addItem(id: Uuid, request: CreateItemRequest): Observable<ListDetail> {
    return this.http.post<ListDetail>(`${BASE_URL}/${id}/items`, request);
  }

  updateItem(id: Uuid, itemId: Uuid, request: UpdateItemRequest): Observable<ListDetail> {
    return this.http.patch<ListDetail>(`${BASE_URL}/${id}/items/${itemId}`, request);
  }

  removeItem(id: Uuid, itemId: Uuid): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}/items/${itemId}`);
  }

  reorderItems(id: Uuid, itemIds: readonly Uuid[]): Observable<ListDetail> {
    return this.http.put<ListDetail>(`${BASE_URL}/${id}/items/order`, { itemIds });
  }

  saveAsTemplate(id: Uuid, request: SaveAsTemplateRequest): Observable<{ templateId: Uuid }> {
    return this.http.post<{ templateId: Uuid }>(`${BASE_URL}/${id}/save-as-template`, request);
  }
}
