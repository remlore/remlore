import { AutoMap } from '@automapper/classes'
import { UserDevice } from '@remlore/ids/core/prisma'

export class UserDeviceEntity implements UserDevice {
  @AutoMap()
  id!: string

  @AutoMap()
  userId!: string

  @AutoMap()
  deviceId!: string

  @AutoMap()
  deviceType!: string

  @AutoMap()
  verified: boolean = false

  @AutoMap()
  userAgent!: string

  @AutoMap()
  isUsing: boolean = false

  @AutoMap()
  lastLoginAt!: Date

  @AutoMap()
  lastLoginIp!: string
}
