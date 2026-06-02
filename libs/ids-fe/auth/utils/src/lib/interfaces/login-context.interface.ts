import { Client } from './client.interface'
import { InteractionDetails } from './interaction-details.interface'

export interface LoginContext {
  uid?: string
  interaction?: InteractionDetails
  type: 'oauth' | 'direct'
  clientInfo?: Client
  redirectUri?: string
}
