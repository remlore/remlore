import { Route } from '@angular/router'

export const authRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'consent',
    loadComponent: () => import('./consent/consent.component').then((m) => m.ConsentComponent)
  },
  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./confirm-email/confirm-email.component').then((m) => m.ConfirmEmailComponent)
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./change-password/change-password.component').then((m) => m.ChangePasswordComponent)
  }
]
