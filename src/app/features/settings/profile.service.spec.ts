import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { Profile } from '../../shared/models';
import { ProfileService } from './profile.service';

const BASE_URL = `${environment.apiUrl}/me`;

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    username: 'erick',
    firstName: 'Erick',
    lastName: 'Macedo',
    email: 'erick@listryx.test',
    emailVerified: true,
    ...overrides,
  };
}

describe('ProfileService', () => {
  let service: ProfileService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProfileService],
    });

    service = TestBed.inject(ProfileService);
    http = TestBed.inject(HttpTestingController);
  });

  // Resource values land a task later, so waiting on a macrotask is what makes them observable.
  async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();
  }

  it('reads the profile from the identity endpoint rather than from a Listryx table', async () => {
    TestBed.tick();

    const request = http.expectOne(BASE_URL);

    expect(request.request.method).toBe('GET');
    request.flush(profile());
    await settle();

    expect(service.profile()?.username).toBe('erick');
  });

  it('reports no profile until one arrives, rather than an empty one the form could save', async () => {
    expect(service.profile()).toBeNull();
  });

  it('still reports no profile when the request fails, so the form stays disabled', async () => {
    TestBed.tick();

    http.expectOne(BASE_URL).flush('nope', { status: 500, statusText: 'Server Error' });
    await settle();

    expect(service.profile()).toBeNull();
  });

  it('refetches after a save, so the screen shows what the server actually stored', async () => {
    TestBed.tick();
    http.expectOne(BASE_URL).flush(profile());
    await settle();

    service
      .update({ firstName: 'Erick', lastName: 'Macedo Silva', email: 'erick@listryx.test' })
      .subscribe();

    const saved = http.expectOne(BASE_URL);

    expect(saved.request.method).toBe('PUT');
    expect(saved.request.body).toEqual({
      firstName: 'Erick',
      lastName: 'Macedo Silva',
      email: 'erick@listryx.test',
    });
    saved.flush(profile({ lastName: 'Macedo Silva' }));
    await settle();

    http.expectOne(BASE_URL).flush(profile({ lastName: 'Macedo Silva' }));
    await settle();

    expect(service.profile()?.lastName).toBe('Macedo Silva');
  });

  it('tracks loading so the form can wait instead of rendering blank fields', async () => {
    TestBed.tick();

    expect(service.isLoading()).toBe(true);

    http.expectOne(BASE_URL).flush(profile());
    await settle();

    expect(service.isLoading()).toBe(false);
  });
});
