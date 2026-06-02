import { AutoMap } from '@automapper/classes'
import { EGender, Profile } from '@remlore/ids/core/prisma'

export class ProfileEntity implements Profile {
  @AutoMap()
  userId!: string

  @AutoMap()
  photoUrl: string | null = null

  @AutoMap()
  backgroundUrl: string | null = null

  @AutoMap()
  bio: string | null = null

  @AutoMap()
  setting!: string

  @AutoMap()
  birthday: Date | null = null

  @AutoMap()
  gender: EGender | null = null

  @AutoMap()
  updatedAt: Date | null = null
}
