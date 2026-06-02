export interface JwtPayload {
  sub: string
  scope?: string
  email: string
  displayName?: string
  photoURL?: string
  roles?: string[]
  [key: string]: any
}
