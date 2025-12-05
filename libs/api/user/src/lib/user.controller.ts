import { Controller, Get, Put, Query, UseGuards } from '@nestjs/common'
import { User } from '@remlore/api/core/decorator'
import { JwtAtGuard } from '@remlore/api/core/guard'
import { UserQuery } from '@remlore/shared/util/types'
import { UserRegisterRemloreDto } from './dto/user-update.dto'
import { UserService } from './user.service'

@Controller('user')
// @UseGuards(OidcJwtAuthGuard)
export class UserController {
  constructor(private apiUserService: UserService) {}

  @Get('me')
  // @RequiredScopes('api.read')
  @UseGuards(JwtAtGuard)
  get() {
    // return this.apiUserService.getProfile(id)
    return { message: 'This is protected data that requires api.read scope' }
  }

  @Put('update-profile')
  update(@User('id') id: number, dto: UserRegisterRemloreDto) {
    return this.apiUserService.updateProfile(id, dto)
  }

  @Get('all')
  getAll(@Query() query: UserQuery) {
    return this.apiUserService.getAll(query)
  }
}
