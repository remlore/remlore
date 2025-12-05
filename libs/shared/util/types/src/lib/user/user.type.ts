export interface UserInfo {
  id: number
  email: string
  remloreUserName?: string
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
}
