import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';
import { describe, expect, it, vi } from 'vitest';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function activate(authenticated: boolean, url = '/lists') {
    const login = vi.fn().mockResolvedValue(undefined);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: { authenticated, login } }],
    });

    const allowed = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );

    return { login, allowed };
  }

  it('lets a signed-in visitor through without touching Keycloak', () => {
    const { allowed, login } = activate(true);

    expect(allowed).toBe(true);
    expect(login).not.toHaveBeenCalled();
  });

  it('turns a signed-out visitor away rather than rendering the page behind the guard', () => {
    expect(activate(false).allowed).toBe(false);
  });

  it('sends a signed-out visitor to Keycloak, back to the page they asked for', () => {
    const { login } = activate(false, '/lists/3f1b8b8e');

    expect(login).toHaveBeenCalledWith({
      redirectUri: `${window.location.origin}/lists/3f1b8b8e`,
    });
  });

  it('keeps the query string, so a deep link survives the round trip through login', () => {
    const { login } = activate(false, '/lists?status=closed');

    expect(login).toHaveBeenCalledWith({
      redirectUri: `${window.location.origin}/lists?status=closed`,
    });
  });
});
