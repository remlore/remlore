import { Global, Module } from '@nestjs/common'
import { JwtAtStrategy } from './jwt-at.strategy'

@Global()
@Module({
  providers: [JwtAtStrategy],
  exports: [JwtAtStrategy]
})
export class StrategiesModule {}
