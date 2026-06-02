import { AutoMap } from '@automapper/classes'
import { EAccountProvider, UserLogin } from '@remlore/ids/core/prisma'

export class UserLoginEntity implements UserLogin {
  @AutoMap()
  userId!: string

  @AutoMap()
  loginProvider!: EAccountProvider

  @AutoMap()
  providerKey!: string

  @AutoMap()
  providerName: string | null = null
}
