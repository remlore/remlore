import { NullAble } from '../utility'

export interface UserInfo {
  userId?: NullAble<string>
  email: string
  verified: boolean
  isRemLoreAccount: boolean
  displayName: NullAble<string>
  rem_loreUsername: NullAble<string>
  photoUrl: NullAble<string>
}

export interface UserSignUp {
  email: string
  username: string
  password: string
}

export interface UserSignIn {
  usernameOrEmail: string
  password: string
}

export interface UserRegister {
  displayName: string
  rem_loreUsername: string
}

export interface UserQuery {
  username: string
  email: string
}
