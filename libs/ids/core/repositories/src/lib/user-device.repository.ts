import { Injectable } from '@nestjs/common'
import { PrismaService, UserDevice } from '@remlore/ids/core/prisma'

@Injectable()
export class UserDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userDevice: UserDevice): Promise<UserDevice> {
    return this.prisma.userDevice.create({
      data: userDevice
    })
  }

  async findById(id: string): Promise<UserDevice | null> {
    return this.prisma.userDevice.findUnique({
      where: { id }
    })
  }

  async findByUserId(userId: string): Promise<UserDevice[]> {
    return this.prisma.userDevice.findMany({
      where: { userId }
    })
  }

  async deleteById(id: string): Promise<UserDevice> {
    return this.prisma.userDevice.delete({
      where: { id }
    })
  }
}
