import { provideHttpClient } from '@angular/common/http'
import { ApplicationConfig } from '@angular/core'
import { provideClientHydration } from '@angular/platform-browser'
import {
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  withRouterConfig
} from '@angular/router'
import { provideAppConfig } from '@remlore/web/core/app-config'
import { provideTitle, SelectRoutePreloadStrategy } from '@remlore/web/core/strategy'
import { appRoutes } from '@remlore/web/shell/feature'
import { LogLevel, provideAuth } from 'angular-auth-oidc-client'
import { environment } from '../environments/environment'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
      withRouterConfig({}),
      withPreloading(SelectRoutePreloadStrategy)
    ),
    provideHttpClient(),
    provideClientHydration(),
    provideAuth({
      config: {
        authority: `${environment.idsUrl}/oidc`,
        redirectUrl: `${environment.baseUrl}/auth/callback`,
        postLogoutRedirectUri: environment.baseUrl,
        clientId: 'remlore',
        scope: 'openid profile email offline_access api.read api.write api',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
        customParamsAuthRequest: {
          resource: environment.apiUrl
        },
        customParamsCodeRequest: {
          resource: environment.apiUrl
        }
      }
    }),
    provideTitle(),
    provideAppConfig(environment),
    SelectRoutePreloadStrategy
  ]
}
