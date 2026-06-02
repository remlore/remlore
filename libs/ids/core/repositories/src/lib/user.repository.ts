import { Injectable } from '@nestjs/common'
import { UserEntity } from '@remlore/ids/core/entities'
import { PrismaService } from '@remlore/ids/core/prisma'

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email }
    })
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    })
  }

  create(data: UserEntity) {
    return this.prisma.user.create({
      data: {
        hashRt: data.hashRt,
        email: data.email,
        passwordHash: data.passwordHash,
        emailVerified: data.emailVerified,
        profile: { create: data.profile || {} },
        devices: { create: data.devices || [] }
      }
    })
  }

  update(id: string, data: Partial<UserEntity>) {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        hashRt: data.hashRt,
        emailVerified: data.emailVerified
      }
    })
  }
}
