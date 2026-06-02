import { Injectable } from '@nestjs/common'
import { PrismaService } from '@remlore/words-api/prisma'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(data: {
    sub: string
    email: string
    displayName?: string
    photoUrl?: string
  }) {
    let user = await this.prisma.user.findUnique({
      where: { sub: data.sub }
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          sub: data.sub,
          email: data.email,
          displayName: data.displayName,
          photoUrl: data.photoUrl
        },
        include: { settings: true }
      })
    }

    return user
  }

  async findBySub(sub: string) {
    return this.prisma.user.findUnique({
      where: { sub }
    })
  }
}
