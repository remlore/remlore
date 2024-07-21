import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { GoogleAuth20Guard, JwtAtGuard, JwtRtGuard, Token, User } from '@rem.lore/api/shared/utils'
import { UserInfo } from '@rem.lore/shared/util/types'
import { AuthService } from './auth.service'
import {
  AuthChangePasswordDto,
  AuthChangePasswordWithTokenDto
} from './dto/auth-change-password.dto'
import { AuthSignInDto } from './dto/auth-sign-in.dto'
import { AuthSignUpDto } from './dto/auth-sign-up.dto'
import { AuthVerifyEmailDto } from './dto/auth-veirfy-email.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.BAD_REQUEST)
  signUp(@Body() authSignUpDto: AuthSignUpDto) {
    return this.authService.signUp(authSignUpDto)
  }

  @Post('sign-in')
  signIn(@Body() authSignInDto: AuthSignInDto) {
    return this.authService.signIn(authSignInDto)
  }

  @Post('confirm-email')
  confirmEmail(@Body() dto: AuthVerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.hash)
  }

  @Post('sign-out')
  @UseGuards(JwtRtGuard)
  signOut(@Token() refreshToken: string) {
    return this.authService.signOut(refreshToken)
  }

  @Post('send-email-change-password')
  sendVerifyEmailChangePassword(@Body() dto: AuthVerifyEmailDto) {
    return this.authService.sendVerifyChangePassword(dto.email)
  }

  @Post('change-password')
  @UseGuards(JwtAtGuard)
  changePassword(@Body() dto: AuthChangePasswordDto) {
    return this.authService.changePassword(dto)
  }

  @Post('change-password-with-token')
  changePasswordWithToken(
    @User('userId') userId: string,
    @Body() dto: AuthChangePasswordWithTokenDto
  ) {
    return this.authService.changePasswordWithToken(dto)
  }

  @Post('refresh-token')
  @UseGuards(JwtRtGuard)
  refreshToken(@Token() accessToken: string) {
    return accessToken
  }

  @Get('auth20')
  @UseGuards(GoogleAuth20Guard)
  signInAuth20() {
    return 'authorized'
  }

  @Get('redirect')
  @UseGuards(GoogleAuth20Guard)
  signInAuth20Riderect() {
    return 'authorized'
  }

  @Get('status')
  status(@User() user: UserInfo) {
    if (user) return user
  }
}
