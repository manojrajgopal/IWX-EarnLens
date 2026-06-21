import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/legal/terms/pages/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy/pages/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'income',
        loadComponent: () =>
          import('./features/income/income-list/income-list.component').then(
            (m) => m.IncomeListComponent,
          ),
      },
      {
        path: 'income/new',
        loadComponent: () =>
          import('./features/income/income-form/income-form.component').then(
            (m) => m.IncomeFormComponent,
          ),
      },
      {
        path: 'income/:id/edit',
        loadComponent: () =>
          import('./features/income/income-edit/income-edit.component').then(
            (m) => m.IncomeEditComponent,
          ),
      },
      {
        path: 'income/:id',
        loadComponent: () =>
          import('./features/income/income-detail/income-detail.component').then(
            (m) => m.IncomeDetailComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/taxonomy/categories/categories.component').then(
            (m) => m.CategoriesComponent,
          ),
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('./features/taxonomy/sources/sources.component').then((m) => m.SourcesComponent),
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./features/taxonomy/tags/tags.component').then((m) => m.TagsComponent),
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./features/activity/activity.component').then((m) => m.ActivityComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'currency',
        loadComponent: () =>
          import('./features/currency/currency.component').then((m) => m.CurrencyComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then((m) => m.ContactComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
