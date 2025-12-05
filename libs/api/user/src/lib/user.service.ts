import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '@remlore/api/prisma'
import { removeUndefined } from '@remlore/shared/util/fucns'
import { MappedValue, UserInfo, UserQuery } from '@remlore/shared/util/types'
import { UserRegisterRemloreDto } from './dto/user-update.dto'

@Injectable()
export class UserService {
  private readonly userDefaultSelector: MappedValue<UserInfo, true> = {
    email: true,
    id: true
  }

  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        remloreUsername: true,
        profile: true
      }
    })
  }

  updateProfile(userId: number, dto: UserRegisterRemloreDto) {
    if (!userId) {
      throw new BadRequestException('user not found!')
    }

    const data = removeUndefined(dto)

    return this.prisma.profile.update({
      where: { userId },
      data
    })
  }

  getAll(query: UserQuery) {
    return this.prisma.user.findMany({
      where: {
        OR: [{}]
      }
    })
  }
}
