import { HttpClient, httpResource } from '@angular/common/http';
import { Service, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PageResponse,
  TemplateDetail,
  TemplateSummary,
  UpsertTemplateRequest,
  Uuid,
  emptyPage,
} from '../../shared/models';

const BASE_URL = `${environment.apiUrl}/templates`;

@Service()
export class TemplateService {
  private readonly http = inject(HttpClient);

  private readonly page = httpResource<PageResponse<TemplateSummary>>(
    () => `${BASE_URL}?size=100`,
    { defaultValue: emptyPage<TemplateSummary>(100) },
  );

  readonly templates = computed(() => this.page.value().content);
  readonly isLoading = computed(() => this.page.isLoading());

  reload(): void {
    this.page.reload();
  }

  detail(id: Uuid): Observable<TemplateDetail> {
    return this.http.get<TemplateDetail>(`${BASE_URL}/${id}`);
  }

  create(request: UpsertTemplateRequest): Observable<TemplateDetail> {
    return this.http.post<TemplateDetail>(BASE_URL, request).pipe(tap(() => this.reload()));
  }

  replace(id: Uuid, request: UpsertTemplateRequest): Observable<TemplateDetail> {
    return this.http
      .put<TemplateDetail>(`${BASE_URL}/${id}`, request)
      .pipe(tap(() => this.reload()));
  }

  remove(id: Uuid): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`).pipe(tap(() => this.reload()));
  }
}
