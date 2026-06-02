import { ProfileEntity } from '@remlore/ids/core/entities'
import { PrismaService } from '@remlore/ids/core/prisma'

export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId }
    })
  }

  updateProfile(userId: string, data: Partial<ProfileEntity>) {
    return this.prisma.profile.update({
      where: { userId },
      data
    })
  }
}
