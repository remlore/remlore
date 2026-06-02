import { Global, Module } from '@nestjs/common'
import { UserModule } from '@remlore/words-api/user'
import { JwtStrategy } from './strategies/jwt.strategy'

@Global()
@Module({
  imports: [UserModule],
  providers: [JwtStrategy],
  exports: [JwtStrategy]
})
export class AuthModule {}
