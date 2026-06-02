import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { SendMailModule } from '@remlore/ids/core/consumer'
import { AuthController } from './auth.controller'
import { AuthProfile } from './auth.profile'
import { AuthService } from './auth.service'
import { JwtAtStrategy } from './strategy/jwt-at.strategy'

@Module({
  imports: [SendMailModule, CacheModule.register()],
  controllers: [AuthController],
  providers: [AuthService, JwtAtStrategy, AuthProfile],
  exports: [JwtAtStrategy]
})
export class AuthModule {}
