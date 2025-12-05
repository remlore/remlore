import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAtStrategy } from './strategy/jwt-at.strategy'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAtStrategy]
})
export class AuthModule {}
