import { Route } from '@angular/router'
import { ConsentComponent, LoginComponent } from '@remlore/ids-fe/auth/feature'
import { NxWelcomeComponent } from './nx-welcome.component'

export const appRoutes: Route[] = [
  {
    path: 'auth/login/:uid',
    component: LoginComponent
  },
  {
    path: 'auth/consent/:uid',
    component: ConsentComponent
  },
  {
    path: '',
    component: NxWelcomeComponent
  }
]
