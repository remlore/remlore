import { InjectionToken, ValueProvider } from '@angular/core'

export interface AppConfig {
  production: boolean
  appName: string
  baseUrl: string
  apiUrl: string
  idsUrl: string
  idsFeUrl: string
}

export const APP_CONFIG = new InjectionToken<AppConfig>('rem-app.config')

export const provideAppConfig = (value: AppConfig): ValueProvider => ({
  provide: APP_CONFIG,
  useValue: value
})
