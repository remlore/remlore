export interface VerifyEmailCache {
  token: string
  count: number
  cooldown: number
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
