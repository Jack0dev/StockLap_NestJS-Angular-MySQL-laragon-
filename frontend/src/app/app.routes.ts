import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/setup-2fa',
    loadComponent: () =>
      import('./features/auth/setup-2fa/setup-2fa.component').then((m) => m.Setup2faComponent),
  },
  {
    path: 'auth/verify-2fa',
    loadComponent: () =>
      import('./features/auth/verify-2fa/verify-2fa.component').then((m) => m.Verify2faComponent),
  },
];
