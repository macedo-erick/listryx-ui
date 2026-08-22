import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldTree, FormField, email, form, maxLength, required } from '@angular/forms/signals';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';
import { injectTranslate } from '../../core/i18n/translate';
import { ListryxCard } from '../../shared/ui/card';
import { ListryxField } from '../../shared/ui/field';
import { ListryxPageHeader } from '../../shared/ui/page-header';
import { ProfileService } from './profile.service';

interface ProfileFormModel {
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'listryx-profile-page',
  imports: [FormField, InputText, Button, ListryxCard, ListryxField, ListryxPageHeader],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  protected readonly service = inject(ProfileService);
  protected readonly auth = inject(AuthService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly t = injectTranslate();
  protected readonly saving = signal(false);

  protected readonly model = signal<ProfileFormModel>({ firstName: '', lastName: '', email: '' });

  protected readonly f = form(this.model, (path) => {
    required(path.firstName, { message: this.t('validation.firstName') });
    maxLength(path.firstName, 255);
    maxLength(path.lastName, 255);
    required(path.email, { message: this.t('validation.emailRequired') });
    email(path.email, { message: this.t('validation.email') });
  });

  constructor() {
    effect(() => {
      const profile = this.service.profile();

      if (profile) {
        this.f().reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        });
      }
    });
  }

  protected errorFor(field: FieldTree<string>): string {
    const state = field();

    if (!state.touched() || !state.invalid()) {
      return '';
    }

    return state.errors()[0]?.message ?? this.t('validation.invalid');
  }

  protected openPasswordChange(): void {
    this.auth.openAccountManagement();
  }

  protected onSubmit(): void {
    this.f().markAsTouched();

    if (this.f().invalid()) {
      this.f().errorSummary()[0]?.fieldTree?.().focusBoundControl();
      return;
    }

    const value = this.model();

    this.saving.set(true);
    this.service
      .update({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.messages.add({
            severity: 'success',
            summary: this.t('profile.updated'),
            life: 3000,
          });
          void this.auth.refreshClaims();
        },
        error: () => this.saving.set(false),
      });
  }
}
