import { AutoMap } from '@automapper/classes'
import { RoleClaim } from '@remlore/ids/core/prisma'

export class RoleClaimEntity implements RoleClaim {
  @AutoMap()
  id!: string

  @AutoMap()
  roleId!: string

  @AutoMap()
  type!: string

  @AutoMap()
  value!: string
}
