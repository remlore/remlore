import { PrismaService } from '@remlore/ids/core/prisma'

export class DeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserid(userId: string) {
    return this.prisma.userDevice.findMany({
      where: { userId }
    })
  }
}
