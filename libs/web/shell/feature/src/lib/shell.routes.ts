import { Route } from '@angular/router'
import { NxWelcomeComponent } from './nx-welcome.component'

export const appRoutes: Route[] = [
  {
    path: '',
    component: NxWelcomeComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('@remlore/web/auth/feature').then((m) => m.authRoutes)
  },
  { path: '**', redirectTo: '' }
]
