import { Controller } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('sign-up')
  // @HttpCode(HttpStatus.CREATED)
  // signUp(@Body() dto: SignUpDto) {
  //   return this.authService.signUp(dto)
  // }

  // @Post('sign-in')
  // @HttpCode(HttpStatus.OK)
  // signIn(@Body() dto: SignInDto) {
  //   return this.authService.signIn(dto)
  // }

  // @Post('verify-sign-up-email')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAtGuard)
  // verifySignUpEmail(@Body() dto: VerifyEmailDto) {
  //   return this.authService.verifySignUpEmail(dto)
  // }

  // @Post('send-verify-sign-up-email')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAtGuard)
  // sendVerifySignUpEMail(@User('email') email: string) {
  //   return this.authService.sendVerifySignUpEMail(email)
  // }

  // @Post('sign-out')
  // @UseGuards(JwtRtGuard)
  // @HttpCode(HttpStatus.OK)
  // signOut(@User('id') id: number) {
  //   return this.authService.signOut(id)
  // }

  // @Post('request-change-password')
  // @HttpCode(HttpStatus.OK)
  // requestChangePasswordEmail(@Body('email') email: string) {
  //   return this.authService.sendChangePasswordEmail(email)
  // }

  // @Patch('change-password-by-old-password')
  // @UseGuards(JwtAtGuard)
  // changePasswordByOldPassword(
  //   @User('id') id: number,
  //   @Body() dto: ChangePasswordByOldPasswordDto
  // ): Promise<RlResponse<AuthResponse<Tokens>>> {
  //   return this.authService.changePasswordByOldPassword(id, dto)
  // }

  // @Patch('change-password-by-token')
  // changePasswordWithToken(@Body() dto: ChangePasswordByTokenDto) {
  //   return this.authService.changePasswordByToken(dto)
  // }

  // @Post('refresh-token')
  // @UseGuards(JwtRtGuard)
  // refreshToken(@Token() accessToken: string) {
  //   return accessToken
  // }

  // @Get('20')
  // @UseGuards(GoogleAuth20Guard)
  // signIn20() {
  //   // unhandle
  // }

  // @Put('link-google-account')
  // @UseGuards(JwtAtGuard)
  // linkGoogleAccount(@User('id') id: number, googleId: string) {
  //   return this.authService.linkGoogleAccount(id, googleId)
  // }

  // @Put('unlink-google-account')
  // @UseGuards(JwtAtGuard)
  // unlinkGoogleAccount(@User('id') id: number) {
  //   return this.authService.unlinkGoogleAccount(id)
  // }

  // @Get('redirect')
  // @UseGuards(GoogleAuth20Guard)
  // signIn20Redirect(@Token() userWithToken: Tokens) {
  //   return userWithToken
  // }

  // @Get('status')
  // @UseGuards(JwtAtGuard)
  // status(@User() user: UserInfo) {
  //   console.log(user)
  //   return user
  // }
}
