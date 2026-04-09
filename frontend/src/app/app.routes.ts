import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
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
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  }
];
