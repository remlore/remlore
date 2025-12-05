import { AppConfig } from '@remlore/web/core/app-config'

export const environment: AppConfig = {
  production: false,
  appName: import.meta.env['REM_APP_NAME'],
  baseUrl: import.meta.env['REM_BASE_URL'],
  apiUrl: import.meta.env['REM_SERVER_API_BASE_URL'],
  idsUrl: import.meta.env['REM_IDS_BASE_URL']
}
