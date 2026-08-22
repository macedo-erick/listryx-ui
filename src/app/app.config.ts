import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { includeBearerTokenInterceptor } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { keycloakBearerTokenConfig, provideKeycloakAuth } from './core/auth/keycloak.providers';
import { errorInterceptor } from './core/http/error.interceptor';
import { TranslatedTitleStrategy } from './core/i18n/translated-title.strategy';
import { TranslationLoader } from './core/i18n/translation-loader';
import { routes } from './app.routes';
import { APP_LOCALES, currentLocale } from './shared/util/locale';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideKeycloakAuth(),
    keycloakBearerTokenConfig,
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor, errorInterceptor])),
    providePrimeNG({
      // Render popup overlays in <body>. With the v20+ default of 'self' the panel is
      // first laid out at its static position inside the trigger's flex row, which on a
      // phone overflows the viewport to the right. Mobile Chrome then zooms out to fit
      // the overflow, so window.innerWidth grows past the layout width and PrimeNG's
      // viewport-collision maths (absolutePosition / calculateBodyScrollbarWidth) both
      // read a viewport that is ~140px too wide.
      overlayAppendTo: 'body',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
        },
      },
      license: environment.primeUiLicense,
    }),
    provideTransloco({
      config: {
        availableLangs: [...APP_LOCALES],
        defaultLang: currentLocale(),
        fallbackLang: 'en-US',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslationLoader,
    }),
    provideAppInitializer(() => inject(TranslocoService).load(currentLocale())),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    MessageService,
    ConfirmationService,
  ],
};
