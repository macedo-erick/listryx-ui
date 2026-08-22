import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'lists' },
      {
        path: 'lists',
        title: 'titles.lists',
        loadComponent: () => import('./features/lists/lists-page').then((m) => m.ListsPage),
      },
      {
        path: 'lists/:id',
        title: 'titles.list',
        loadComponent: () =>
          import('./features/lists/list-detail-page').then((m) => m.ListDetailPage),
      },
      {
        path: 'templates',
        title: 'titles.templates',
        loadComponent: () =>
          import('./features/templates/templates-page').then((m) => m.TemplatesPage),
      },
      {
        path: 'profile',
        title: 'titles.profile',
        loadComponent: () => import('./features/settings/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'insights',
        title: 'titles.insights',
        loadComponent: () =>
          import('./features/insights/insights-page').then((m) => m.InsightsPage),
      },
    ],
  },
  {
    path: '**',
    title: 'titles.notFound',
    loadComponent: () => import('./features/not-found-page').then((m) => m.NotFoundPage),
  },
];
