export const environment = {
  production: false,
  nodeEnv: import.meta.env['NODE_ENV'],
  baseURL: import.meta.env['REM_BASE_URL'],
  idsUrl: import.meta.env['REM_IDS_BASE_URL'],
  apiUrl: import.meta.env['REM_SERVER_API_BASE_URL']
}
