import { Module } from '@nestjs/common'
import { AuthModule } from '@remlore/api/auth'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [AuthModule]
})
export class UserModule {}
