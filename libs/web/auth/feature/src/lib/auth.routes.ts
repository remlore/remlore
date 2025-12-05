import { Route } from '@angular/router'
import { CallbackComponent } from './callback/callback.component'

export const authRoutes: Route[] = [
  {
    path: 'callback',
    component: CallbackComponent,
    title: 'Redirect'
  }
]
