import { AutoMap } from '@automapper/classes'
import { EmailVerification } from '@remlore/ids/core/prisma'

export class EmailVerificationEntity implements EmailVerification {
  @AutoMap()
  id!: string

  @AutoMap()
  userId!: string

  @AutoMap()
  token!: string

  @AutoMap()
  expiresAt!: Date

  @AutoMap()
  createdAt!: Date

  @AutoMap()
  updatedAt!: Date | null
}
