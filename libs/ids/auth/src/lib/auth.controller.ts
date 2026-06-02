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
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Token, User, Useragent } from '@remlore/ids/core/decorator'
import { GoogleAuth20Guard, JwtAtGuard, JwtRtGuard } from '@remlore/ids/core/guard'
import { OidcService } from '@remlore/ids/oidc'
import { RlResponse, Tokens, UserInfo } from '@remlore/shared/util/types'
import { Request, Response } from 'express'
import { InteractionResults } from 'oidc-provider'
import { IResult as Agent } from 'ua-parser-js'
import { AuthService } from './auth.service'
import {
  ChangePasswordByOldPasswordDto,
  ChangePasswordByTokenDto,
  SignUpDto,
  VerifyEmailDto
} from './dto'

const COOKIE_SESSION_EXP = 1_209_600_000 // 14 days in ms
const COOKIE_PENDING_EXP = 86_400_000 // 1 day in ms
const COOKIE_NAME = 'session_token'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly oidcService: OidcService
  ) {}

  /**
   * Creates a new Pending user and sets an httpOnly pending session cookie.
   * The cookie carries all identity needed for subsequent verify/resend calls —
   * the frontend does NOT need to store or send any token in the body.
   *
   * Body: SignUpDto (email, password, displayName, deviceId)
   * Query param (optional): ?uid={interactionUid}  ← present when coming from OAuth flow
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignUpDto,
    @Useragent() agent?: Agent
  ) {
    const interactionUid = req.query['uid'] as string | undefined

    const result = await this.authService.signUp(dto, interactionUid, agent, req.ip)

    // Set pending session cookie immediately — this is the only place
    // the token touches the HTTP layer. The frontend never sees it.
    this.setSessionCookie(res, result.pendingSessionToken, false)

    return {
      message: result.message,
      // Also return token in body for SPA / mobile clients that prefer it
      pendingSession: {
        token: result.pendingSessionToken,
        expiresAt: result.pendingSessionExpiresAt
      }
    }
  }

  /**
   * Verifies the email token submitted by the user.
   *
   * Authentication: pending session cookie (set during sign-up)
   * Body: { token: string }  — the code/token from the email link
   *
   * On success:
   * - Upgrades session cookie from pending (1 day) → full (14 days)
   * - If an OIDC interactionUid is stored in the session:
   *     → calls interactionFinished() and returns a redirectTo URL
   *       so the frontend can navigate the user back to the client app
   * - Otherwise returns redirectTo: "/dashboard"
   */
  @Post('verify-sign-up-email')
  @HttpCode(HttpStatus.OK)
  async verifySignUpEmail(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Useragent() agent?: Agent
  ) {
    const sessionPayload = await this.resolveSessionFromCookie(req)

    const result = await this.authService.verifySignUpEmail(dto, sessionPayload, agent, req.ip)

    this.setSessionCookie(res, result.session.token, true)

    if (result.interactionUid) {
      try {
        const redirectTo = await this.resumeOidcInteraction(req, res, result.user.id)

        return {
          success: true,
          message: result.message,
          user: result.user,
          redirectTo // e.g. "http://localhost:4200/callback?code=...&state=..."
        }
      } catch (oidcError) {
        // Interaction may have expired (user took too long to verify).
        // Still return success for the verification itself — the user
        // can start a new OAuth flow from the client app.
        console.warn('[verifySignUpEmail] OIDC interaction resume failed:', oidcError)

        return {
          success: true,
          message: result.message,
          user: result.user,
          redirectTo: '/dashboard',
          warning: 'Your login session expired. Please go back to the app and log in again.'
        }
      }
    }

    return {
      message: 'Email verified successfully',
      user: result.user,
      session: {
        token: result.session.token,
        expiresAt: result.session.expiresAt
      }
    }
  }

  @Post('resend-verification-email')
  resendVerificationEmail(@User('email') email: string) {
    return this.authService.resendVerificationEmail(email)
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
  ): Promise<RlResponse> {
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

  /**
   * Sets the session cookie on the response.
   *
   * @param isFullSession - false = pending (1 day), true = full (14 days)
   */
  private setSessionCookie(res: Response, token: string, isFullSession: boolean) {
    const isProduction = this.config.get('NODE_ENV') === 'production'

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true, // JS cannot read this cookie
      secure: isProduction, // HTTPS only in prod
      sameSite: 'lax', // Protects against CSRF
      maxAge: isFullSession ? COOKIE_SESSION_EXP : COOKIE_PENDING_EXP
    })
  }

  /**
   * Reads the session_token cookie from the request and resolves
   * it to a SessionPayload via the database.
   * Throws UnauthorizedException if missing or invalid.
   */
  private async resolveSessionFromCookie(req: Request) {
    const token = req.cookies?.[COOKIE_NAME]

    if (!token) {
      throw new UnauthorizedException('No session cookie found. Please sign up again.')
    }

    return this.authService.resolveSession(token)
  }

  /**
   * Calls oidc-provider interactionFinished to complete the login step
   * and returns the redirect URL to send the user back to the client app.
   *
   * Note: interactionFinished internally calls res.redirect() — we use
   * passthrough: false on @Res() in callers that need this,
   * but here we use a trick: call interactionResult() to get the URL
   * without actually sending the redirect, then return it for the SPA to handle.
   */
  private async resumeOidcInteraction(
    req: Request,
    res: Response,
    userId: string
  ): Promise<string> {
    const result: InteractionResults = {
      login: {
        accountId: userId,
        remember: true,
        ts: Math.floor(Date.now() / 1000)
      }
    }

    // interactionFinished sends a redirect. For an SPA we need the URL, not a 302.
    // We capture where oidc-provider wants to redirect and return it as JSON.
    // The frontend will then do: window.location.href = redirectTo
    const redirectTo = await this.oidcService.interactionResult(req, res, result, {
      mergeWithLastSubmission: false
    })

    return redirectTo
  }
}
