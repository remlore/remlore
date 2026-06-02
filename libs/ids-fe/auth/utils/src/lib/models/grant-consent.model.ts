export interface GrantConsent {
  uid: string
  scopes: string[]
  remember?: boolean
}

export interface GrantConsentResponse {
  redirectTo: string
}
