import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
1
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
