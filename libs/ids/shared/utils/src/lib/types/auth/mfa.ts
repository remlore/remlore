export interface MfaCache {
  userId: string
  code: string
  expiresAt: Date
}
