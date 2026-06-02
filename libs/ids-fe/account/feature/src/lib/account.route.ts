import { Route } from '@angular/router'

export const accountRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./account/account.component').then((m) => m.AccountComponent),
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'devices',
        loadComponent: () => import('./devices/devices.component').then((m) => m.DevicesComponent)
      },
      {
        path: 'linked-accounts',
        loadComponent: () =>
          import('./linked-accounts/linked-accounts.component').then(
            (m) => m.LinkedAccountsComponent
          )
      }
    ]
  }
]
