import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { SendMailModule } from '@remlore/ids/core/consumer'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [SendMailModule, CacheModule.register()],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
