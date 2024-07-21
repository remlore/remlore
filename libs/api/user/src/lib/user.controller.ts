import { Controller, Get, Put, Query, UseGuards } from '@nestjs/common'
import { JwtAtGuard, User } from '@rem.lore/api/shared/utils'
import { UserQuery } from '@rem.lore/shared/util/types'
import { UserRegisterRemloreDto } from './dto/user-update.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private apiUserService: UserService) {}

  @Get('me')
  @UseGuards(JwtAtGuard)
  get(@User('userId') userId: string) {
    return this.apiUserService.getProfile(userId)
  }

  @Put('register-remlore')
  update(@User('userId') userId: string, dto: UserRegisterRemloreDto) {
    return this.apiUserService.updateProfile(userId, dto)
  }

  @Get('all')
  getAll(@Query() query: UserQuery) {
    return this.apiUserService.getAll(query)
  }
}
