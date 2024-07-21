import { NullAble } from '../utility'
import { UserInfo } from './user.type'

export interface AuthResponse<AT = object> {
  statusCode: NullAble<number>
  status: NullAble<'success' | 'failed'>
  message: string[] | string
  user: NullAble<UserInfo> & NullAble<AT>
  error: NullAble<string>
}

export interface Tokens {
  refreshToken?: string
  accessToken: string
}

export interface JWTEncode {
  sub: string
  email: string
}
