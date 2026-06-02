import { AutoMap } from '@automapper/classes'
import { EUserStatus, User } from '@remlore/ids/core/prisma'
import { EmailVerificationEntity } from './email-verification.entity'
import { ProfileEntity } from './profile.entity'
import { UserDeviceEntity } from './user-device.entity'
import { UserLoginEntity } from './user-login.entity'

export class UserEntity implements User {
  @AutoMap()
  id!: string

  @AutoMap()
  email!: string

  @AutoMap()
  displayName: string | null = null

  @AutoMap()
  passwordHash: string | null = null

  @AutoMap()
  emailVerified: boolean = false

  @AutoMap()
  status: EUserStatus = EUserStatus.Active

  hashRt: string | null = null

  @AutoMap()
  mfaEnabled!: boolean

  mfaSecret!: string | null

  @AutoMap()
  createdAt!: Date

  @AutoMap()
  updatedAt!: Date | null

  @AutoMap(() => ProfileEntity)
  profile?: ProfileEntity

  @AutoMap(() => [EmailVerificationEntity])
  emailVerifications?: EmailVerificationEntity[]

  @AutoMap(() => [UserLoginEntity])
  logins?: UserLoginEntity[]

  @AutoMap(() => [UserDeviceEntity])
  devices?: UserDeviceEntity[]
}
