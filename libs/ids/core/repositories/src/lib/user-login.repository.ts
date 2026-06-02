import { UserLoginEntity } from '@remlore/ids/core/entities'
import { EAccountProvider, PrismaService } from '@remlore/ids/core/prisma'

export class UserLoginRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.userLogin.findMany({
      where: { userId }
    })
  }

  create(data: UserLoginEntity) {
    return this.prisma.userLogin.create({
      data: {
        userId: data.userId,
        loginProvider: data.loginProvider,
        providerKey: data.providerKey,
        providerName: data.providerName
      }
    })
  }

  delete(userId: string, loginProvider: EAccountProvider) {
    return this.prisma.userLogin.deleteMany({
      where: { userId, loginProvider }
    })
  }
}
