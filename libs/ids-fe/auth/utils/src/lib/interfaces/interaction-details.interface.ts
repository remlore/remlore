import { Client } from '../interfaces'

export interface InteractionDetails {
  uid: string
  type: 'login' | 'consent'
  client: Client
  params: {
    scope: string
    redirectUri: string
    state: string
  }
  session: {
    accountId: string
  } | null
}
