import { HttpClient, httpResource } from '@angular/common/http';
import { Service, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Profile, ProfileRequest } from '../../shared/models';

const BASE_URL = `${environment.apiUrl}/me`;

@Service()
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly resource = httpResource<Profile>(() => BASE_URL);

  readonly profile = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  readonly isLoading = computed(() => this.resource.isLoading());

  update(request: ProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(BASE_URL, request).pipe(tap(() => this.resource.reload()));
  }
}
