import { Maybe } from '../utility'
import { UserInfo } from './user.type'

export interface AuthResponse<AT = object> {
  statusCode: Maybe<number>
  status: Maybe<'success' | 'failed'>
  message: string[] | string
  user: Maybe<UserInfo> & Maybe<AT>
  error: Maybe<string>
}

export interface Tokens {
  refreshToken?: string
  accessToken: string
}

export interface JWTEncode {
  sub: string
  email: string
}
