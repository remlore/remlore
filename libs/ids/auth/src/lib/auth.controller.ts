import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common'
import { Token, User } from '@remlore/api/core/decorator'
import { GoogleAuth20Guard, JwtAtGuard, JwtRtGuard } from '@remlore/api/core/guard'
import { Useragent } from '@remlore/ids/core/decorator'
import { AuthResponse, RlResponse, Tokens, UserInfo } from '@remlore/shared/util/types'
import { Request } from 'express'
import { InteractionHelper, OidcInteraction } from 'nest-oidc-provider'
import { Agent } from 'useragent'
import { AuthService } from './auth.service'
import {
  ChangePasswordByOldPasswordDto,
  ChangePasswordByTokenDto,
  SignUpDto,
  VerifyEmailDto
} from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(
    @Req() req: Request,
    @Body() dto: SignUpDto,
    @Useragent() agent: Agent
  ): Promise<RlResponse> {
    console.log('Controller', agent)
    return this.authService.signUp(dto, agent, req.ip)
  }

  @Post('verify-sign-up-email')
  @HttpCode(HttpStatus.OK)
  verifySignUpEmail(
    @OidcInteraction() interaction: InteractionHelper,
    @Body() dto: VerifyEmailDto
  ) {
    return this.authService.verifySignUpEmail(interaction, dto)
  }

  @Post('send-verify-sign-up-email')
  @HttpCode(HttpStatus.OK)
  sendVerifySignUpEMail(@Body('email') email: string) {
    return this.authService.sendVerifySignUpEMail(email)
  }

  @Post('sign-out')
  @UseGuards(JwtRtGuard)
  @HttpCode(HttpStatus.OK)
  signOut(@User('id') id: string) {
    return this.authService.signOut(id)
  }

  @Post('request-change-password')
  @HttpCode(HttpStatus.OK)
  requestChangePasswordEmail(@Body('email') email: string) {
    return this.authService.sendChangePasswordEmail(email)
  }

  @Patch('change-password-by-old-password')
  @UseGuards(JwtAtGuard)
  changePasswordByOldPassword(
    @User('id') id: string,
    @Body() dto: ChangePasswordByOldPasswordDto
  ): Promise<RlResponse<AuthResponse<Tokens>>> {
    return this.authService.changePasswordByOldPassword(id, dto)
  }

  @Patch('change-password-by-token')
  changePasswordWithToken(@Body() dto: ChangePasswordByTokenDto) {
    return this.authService.changePasswordByToken(dto)
  }

  @Post('refresh-token')
  @UseGuards(JwtRtGuard)
  refreshToken(@Token() accessToken: string) {
    return accessToken
  }

  @Get('20')
  @UseGuards(GoogleAuth20Guard)
  signIn20() {
    // unhandle
  }

  @Put('link-google-account')
  @UseGuards(JwtAtGuard)
  linkGoogleAccount(@User('id') id: string, googleId: string) {
    return this.authService.linkGoogleAccount(id, googleId)
  }

  @Put('unlink-google-account')
  @UseGuards(JwtAtGuard)
  unlinkGoogleAccount(@User('id') id: string) {
    return this.authService.unlinkGoogleAccount(id)
  }

  @Get('redirect')
  @UseGuards(GoogleAuth20Guard)
  signIn20Redirect(@Token() userWithToken: Tokens) {
    return userWithToken
  }

  @Get('status')
  @UseGuards(JwtAtGuard)
  status(@User() user: UserInfo) {
    console.log(user)
    return user
  }
}
