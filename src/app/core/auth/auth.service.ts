import { Location } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

interface ListryxTokenClaims {
  readonly sub?: string;
  readonly name?: string;
  readonly preferred_username?: string;
  readonly given_name?: string;
  readonly email?: string;
}

@Service()
export class AuthService {
  private readonly keycloak = inject(Keycloak);

  private readonly location = inject(Location);

  private readonly claims = signal<ListryxTokenClaims>(
    (this.keycloak.tokenParsed ?? {}) as ListryxTokenClaims,
  );

  readonly isAuthenticated = computed(() => this.keycloak.authenticated ?? false);

  readonly userId = computed(() => this.claims().sub ?? null);

  readonly username = computed(() => this.claims().preferred_username ?? '');

  readonly email = computed(() => this.claims().email ?? '');

  readonly displayName = computed(() => {
    const c = this.claims();
    return c.name || c.given_name || c.preferred_username || 'User';
  });

  readonly initials = computed(() =>
    this.displayName()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  );

  async refreshClaims(): Promise<void> {
    await this.keycloak.updateToken(-1);
    this.claims.set((this.keycloak.tokenParsed ?? {}) as ListryxTokenClaims);
  }

  login(redirectPath = '/'): void {
    void this.keycloak.login({ redirectUri: this.absoluteUrl(redirectPath) });
  }

  logout(): void {
    void this.keycloak.logout({ redirectUri: this.absoluteUrl('/') });
  }

  private absoluteUrl(path: string): string {
    return `${window.location.origin}${this.location.prepareExternalUrl(path)}`;
  }

  openAccountManagement(): void {
    void this.keycloak.accountManagement();
  }
}
