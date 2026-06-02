export interface VerifyEmailCache {
  email: string
  count: number
  nextAllowedAt: number
  pendingEmailVerification?: PendingEmailVerification
}

export interface VerifyEmailJobData {
  email: string
  token: string
}

export interface ChangePasswordJobData {
  email: string
  token: string
  remloreUsername: string
}

export interface OtpJobData {
  email: string
  otp: string
  ttl: string
}

export interface PendingEmailVerification {
  userId: string
  interactionUid: string
  expiresAt: Date
  redirectUrl?: string
}
