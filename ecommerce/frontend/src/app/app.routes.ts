import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },

  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized').then(m => m.UnauthorizedComponent)
  },

  {
    path: 'admin',
    canActivate: [roleGuard(['ADMIN'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      }
    ]
  },

  {
    path: 'seller',
    canActivate: [roleGuard(['SELLER'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/seller/dashboard/seller-dashboard').then(m => m.SellerDashboardComponent)
      }
    ]
  },

  {
    path: 'customer',
    canActivate: [roleGuard(['CUSTOMER'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/customer/dashboard/customer-dashboard').then(m => m.CustomerDashboardComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
