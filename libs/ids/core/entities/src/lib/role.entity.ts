import { AutoMap } from '@automapper/classes'
import { Role } from '@remlore/ids/core/prisma'

export class RoleEntity implements Role {
  @AutoMap()
  id!: string

  @AutoMap()
  name!: string
}
