import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '@rem.lore/api/prisma'
import { MapedValue, UserInfo, UserQuery } from '@rem.lore/shared/util/types'
import { UserRegisterRemloreDto } from './dto/user-update.dto'

@Injectable()
export class UserService {
  private readonly userDefaultSelector: MapedValue<UserInfo, true> = {
    email: true,
    rem_loreUsername: true,
    displayName: true,
    photoUrl: true,
    verified: true,
    isRemLoreAccount: true
  }

  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
      select: {
        email: true,
        rem_loreUsername: true,
        displayName: true,
        photoUrl: true,
        createdAt: true
      }
    })
  }

  updateProfile(userId: string, dto: UserRegisterRemloreDto) {
    if (!userId) throw new BadRequestException('userId unknow')

    return this.prisma.user.update({
      where: { userId },
      data: dto,
      select: this.userDefaultSelector
    })
  }

  getAll(query: UserQuery) {
    return this.prisma.user.findMany({
      where: {
        OR: query
      }
    })
  }
}
