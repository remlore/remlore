import { Routes } from '@angular/router'

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('@remlore/ids-fe/auth/feature').then((m) => m.authRoutes)
  },
  {
    path: 'account',
    loadChildren: () => import('@remlore/ids-fe/account/feature').then((m) => m.accountRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
]
