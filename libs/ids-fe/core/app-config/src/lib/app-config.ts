import { InjectionToken, ValueProvider } from '@angular/core'

export interface AppConfig {
  production: boolean
  nodeEnv: string
  baseURL: string
  apiUrl: string
  idsUrl: string
}

export const APP_CONFIG = new InjectionToken<AppConfig>('rem-ids-fe.config')

export const provideAppConfig = (value: AppConfig): ValueProvider => ({
  provide: APP_CONFIG,
  useValue: value
})
