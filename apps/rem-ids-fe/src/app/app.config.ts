import { provideHttpClient, withFetch } from '@angular/common/http'
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideClientHydration } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'
import { provideAppConfig } from '@remlore/ids-fe/core/app-config'
import { appRoutes } from '@remlore/ids-fe/shell/feature'
import { environment } from '../environments/environment'

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppConfig(environment),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes)
  ]
}
