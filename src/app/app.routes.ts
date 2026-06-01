import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard-module').then((m) => m.DashboardModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'manager'] },
  },
  {
    path: 'categories',
    loadChildren: () => import('./modules/categories/categories-module').then((m) => m.CategoriesModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'manager'] },
  },
  {
    path: 'products',
    loadChildren: () => import('./modules/products/products-module').then((m) => m.ProductsModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'manager'] },
  },
  {
    path: 'customers',
    loadChildren: () => import('./modules/customers/customers-module').then((m) => m.CustomersModule),
    canActivate: [authGuard],
  },
  {
    path: 'pos',
    loadChildren: () => import('./modules/pos/pos-module').then((m) => m.PosModule),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadChildren: () => import('./modules/orders/orders-module').then((m) => m.OrdersModule),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'pos',
  },
];
