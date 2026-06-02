import { Injectable } from '@nestjs/common'
import { PrismaService } from '@remlore/ids/core/prisma'

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(name: string) {
    return this.prisma.role.findMany({
      where: { name }
    })
  }

  create(name: string) {
    return this.prisma.role.create({
      data: { name }
    })
  }

  delete(name: string) {
    return this.prisma.role.deleteMany({
      where: { name }
    })
  }
}
