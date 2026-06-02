import { AppConfig } from '@remlore/web/core/app-config'

export const environment: AppConfig = {
  production: false,
  appName: import.meta.env['REM_APP_NAME'],
  baseUrl: import.meta.env['REM_URL'],
  apiUrl: import.meta.env['API_URL'],
  idsUrl: import.meta.env['IDS_URL'],
  idsFeUrl: import.meta.env['IDS_FE_URL']
}
