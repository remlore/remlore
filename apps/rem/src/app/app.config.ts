import { ApplicationConfig } from '@angular/core'
import { provideRouter, Route, withInMemoryScrolling, withRouterConfig } from '@angular/router'

import { provideClientHydration } from '@angular/platform-browser'

const appRoutes: Route[] = []
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
      withRouterConfig({})
    ),
    provideClientHydration()
  ]
}
