import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Drawer } from 'primeng/drawer';
import { Popover } from 'primeng/popover';
import { Toast } from 'primeng/toast';

import { AuthService } from '../core/auth/auth.service';
import { CurrencyService } from '../core/currency.service';
import { LocaleService } from '../core/i18n/locale.service';
import { injectTranslate } from '../core/i18n/translate';
import { ThemeService } from '../core/theme.service';
import { ListryxLogo } from '../shared/ui/logo';
import { NAV_ITEMS } from './nav-items';

@Component({
  selector: 'listryx-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    Button,
    Drawer,
    Popover,
    Toast,
    ConfirmDialog,
    ListryxLogo,
  ],
  templateUrl: './shell.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly locale = inject(LocaleService);
  protected readonly currency = inject(CurrencyService);
  protected readonly t = injectTranslate();
  protected readonly navItems = NAV_ITEMS;
  protected readonly homeRoute = '/lists';
  protected readonly mobileNavOpen = signal(false);
}
