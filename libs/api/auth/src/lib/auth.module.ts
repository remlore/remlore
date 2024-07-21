import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { UserModule } from '@rem.lore/api/user'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { MailConsumer } from './consumer/mail.consumer'
import { UserSerializer } from './serialize/user.serialize'
import { GoogleStrategy } from './strategy/google.strategy'
import { JwtAtStrategy } from './strategy/jwt-at.strategy'
import { JwtRtStrategy } from './strategy/jwt-rt.strategy'

@Module({
  imports: [UserModule, BullModule.registerQueue({ name: 'send-mail' })],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    UserSerializer,
    MailConsumer,
    JwtAtStrategy,
    JwtRtStrategy
  ]
})
export class AuthModule {}
