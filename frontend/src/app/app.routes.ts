import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'market',
    loadComponent: () => import('./features/market/market-layout/market-layout.component'),
    children: [
      { path: '', redirectTo: 'stocks', pathMatch: 'full' },
      { path: 'stocks', loadComponent: () => import('./features/market/stock-list/stock-list.component') },
      { path: 'stocks/:id', loadComponent: () => import('./features/market/stock-detail/stock-detail.component') },
      { path: 'watchlist', loadComponent: () => import('./features/market/watchlist/watchlist.component') },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component'),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/admin/dashboard/dashboard.component') 
      },
      { 
        path: 'users', 
        loadComponent: () => import('./features/admin/user-management/user-management.component') 
      },
      { 
        path: 'stocks-orders', 
        loadComponent: () => import('./features/admin/stock-order-management/stock-order-management.component') 
      },
    ]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component')
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component')
  },
  {
    path: 'auth/verify-otp',
    loadComponent: () => import('./features/auth/verify-otp/verify-otp.component')
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component')
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }
];
