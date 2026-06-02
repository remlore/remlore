import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res
} from '@nestjs/common'
import { PrismaService } from '@remlore/ids/core/prisma'
import { OidcService } from '@remlore/ids/oidc'
import { RlResponse } from '@remlore/shared/util/types'
import { Request, Response } from 'express'
import { InteractionResults } from 'oidc-provider'
import { SignInDto, VerifyMfaDto } from './dto'
import { ConsentDto } from './dto/consent.dto'
import { InteractionService } from './interaction.service'

@Controller('interaction')
export class InteractionController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly oidcService: OidcService,
    private readonly interactionService: InteractionService
  ) {}

  @Get(':uid')
  @HttpCode(HttpStatus.OK)
  async interaction(@Req() req: Request, @Res() res: Response) {
    try {
      const interactionDetail = await this.oidcService.interactionDetails(req, res)

      const {
        prompt: { name: interactionType, details },
        params,
        session,
        uid
      } = interactionDetail

      const client = await this.interactionService.getClientInfo(params['client_id'] as string)

      const hasSession = !!session?.accountId

      let userInfo = null
      if (hasSession) {
        userInfo = await this.interactionService.getUserInfo(session.accountId)
      }

      // Check existing consent
      let hasConsent = false
      let consentScopes: string[] = []
      if (hasSession) {
        const existingConsent = await this.interactionService.getExistingConsent(
          session.accountId,
          params['client_id'] as string
        )

        if (existingConsent) {
          hasConsent = true
          consentScopes = existingConsent.scopes

          // Check if existing consent covers all requested scopes
          const requestedScopes = (params['scope'] as string).split(' ')
          const hasAllScopes = requestedScopes.every((scope) => consentScopes.includes(scope))

          // If consent covers all scopes and it's not expired, we can auto-complete
          if (hasAllScopes && interactionType === 'consent') {
            // Auto-grant consent without showing UI
            await this.autoGrantConsent(req, res, session.accountId)
            return // Response already sent by autoGrantConsent
          }
        }
      }

      return {
        uid,
        type: interactionType,

        // Session info
        hasSession,
        session: hasSession
          ? {
              accountId: session.accountId,
              user: userInfo
            }
          : null,

        // Client info
        client: {
          clientId: client.clientId,
          clientName: client.clientName
        },

        // Request params
        params: {
          scope: params['scope'],
          redirectUri: params['redirect_uri'],
          state: params['state'],
          requestedScopes: (params['scope'] as string).split(' ')
        },

        // Consent info
        consent: {
          hasExistingConsent: hasConsent,
          grantedScopes: consentScopes
        },

        // What prompts are needed
        prompts: details
      }
    } catch {
      throw new HttpException('Interaction not found or expired', HttpStatus.NOT_FOUND)
    }
  }

  @Post(':uid/login')
  @HttpCode(HttpStatus.CREATED)
  async loginCheck(
    @Param('uid') uid: string,
    @Body() dto: SignInDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const interaction = await this.oidcService.interactionDetails(req, res)
    const result = await this.interactionService.validateLogin(dto.email, dto.password)

    if (!result.success || !result.data) {
      throw new BadRequestException('Invalid email or password')
    }

    // NEW: Check if email is verified
    if (!result.data.emailVerified) {
      // Store the interaction UID in a temporary token
      const pendingToken = await this.interactionService.createPendingVerification(
        result.data.id,
        uid
      )

      throw new ForbiddenException({
        emailNotVerified: true,
        message: 'Please verify your email before logging in',
        userId: result.data.id,
        email: result.data.email,
        pendingToken
      })
    }

    if (result.data.mfaEnabled) {
      const tempToken = await this.interactionService.generateMfaCode(result.data.id)

      return {
        mfaRequired: true,
        tempToken,
        message: 'MFA code sent to your email'
      }
    }

    // return this.interactionService.login(interaction, dto)
    await this.completeLogin(req, res, result.data.id, dto.remember)

    return { message: 'Login successful' }
  }

  /**
   * Verify MFA code
   */
  @Post(':uid/mfa/verify')
  async verifyMfa(
    @Param('uid') uid: string,
    @Body() mfaDto: VerifyMfaDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const interaction = await this.oidcService.interactionDetails(req, res)
      const result = await this.interactionService.verifyMfaCode(mfaDto.tempToken, mfaDto.code)

      if (!result.success) {
        throw new BadRequestException(result.message)
      }

      await this.completeLogin(req, res, result.data!, mfaDto.remember)

      return {
        message: 'MFA verification successful'
      }
    } catch (error) {
      console.error('MFA verification error:', error)
      throw new HttpException('MFA verification failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // /**
  //  * Switch account (logout current user and show login)
  //  */
  // @Post(':uid/switch-account')
  // async switchAccount(@Param('uid') uid: string, interaction: InteractionHelper, @Req() req: Request, @Res() res: Response) {
  //   try {
  //     const { } = await interaction.details()

  //     // Force login prompt by completing interaction with login prompt
  //     const result: InteractionResults = {
  //       login: {
  //         accountId: null // No account, force login
  //       }
  //     }

  //     await interaction.finished(result, { mergeWithLastSubmission: false })

  //     return res.json({
  //       success: true,
  //       message: 'Please login with different account'
  //     })
  //   } catch (error) {
  //     console.error('Switch account error:', error)
  //     throw new HttpException('Failed to switch account', HttpStatus.INTERNAL_SERVER_ERROR)
  //   }
  // }

  @Get(':uid/consent')
  async consentDetails(@Req() req: Request, @Res() res: Response) {
    const interaction = await this.oidcService.interactionDetails(req, res)
    const {
      prompt: { name },
      params
    } = interaction

    if (name === 'consent') {
      return {
        client: params['client_id'],
        scopes: (params['scope'] as string)?.split(' ') || []
      }
    }

    throw new BadRequestException('Invalid prompt')
  }

  @Post(':uid/consent')
  async confirm(
    @Body() consentDto: ConsentDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<RlResponse> {
    try {
      const interaction = await this.oidcService.interactionDetails(req, res)

      if (!interaction.session?.accountId) {
        throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED)
      }

      const {
        params,
        session: { accountId }
      } = interaction

      const requestedScopes = (params['scope'] as string).split(' ')
      const grantedScopes = consentDto.grantedScopes.filter((scope) =>
        requestedScopes.includes(scope)
      )

      if (grantedScopes.length === 0) {
        throw new HttpException('At least one scope must be granted', HttpStatus.BAD_REQUEST)
      }

      // Save consent if remember is checked
      if (consentDto.rememberConsent) {
        await this.interactionService.saveConsent(
          accountId,
          params['client_id'] as string,
          grantedScopes
        )
      }

      // Create grant
      const grant = new (this.oidcService.getProvider() as any).Grant({
        accountId,
        clientId: params['client_id']
      })

      for (const scope of grantedScopes) {
        grant.addOIDCScope(scope)
      }

      if (params['resource']) {
        grant.addResourceScope(params['resource'], grantedScopes)
      }

      const grantId = await grant.save()

      // Complete the interaction
      const result = {
        consent: {
          grantId
        }
      }

      await this.oidcService.interactionFinished(req, res, result, {
        mergeWithLastSubmission: false
      })

      return {
        success: true,
        message: 'Consent accepted'
      }
    } catch (error) {
      console.error('Consent error:', error)
      throw new HttpException('Consent failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':uid/abort')
  async abortLogin(@Req() req: Request, @Res() res: Response) {
    const result = {
      error: 'access_denied',
      error_description: 'End-user aborted interaction'
    }

    await this.oidcService.interactionFinished(req, res, result, { mergeWithLastSubmission: false })
  }

  async saveConsent(userId: string, clientId: string, scopes: string[]) {
    // Set expiration to 1 year from now
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    return this.prisma.consent.upsert({
      where: {
        userId_clientId: {
          userId,
          clientId
        }
      },
      create: {
        userId,
        clientId,
        scopes,
        expiresAt
      },
      update: {
        scopes,
        expiresAt,
        grantedAt: new Date()
      }
    })
  }

  private async completeLogin(
    @Req() req: Request,
    @Res() res: Response,
    userId: string,
    remember: boolean
  ) {
    const interaction = await this.oidcService.interactionDetails(req, res)

    const {
      prompt: { name, details },
      params
    } = interaction

    // Check if consent was already given
    const existingConsent = await this.interactionService.getExistingConsent(
      userId,
      params['client_id'] as string
    )

    const result: InteractionResults = {
      login: {
        accountId: userId,
        remember: remember !== false, // Default to true
        ts: Math.floor(Date.now() / 1000)
      }
    }

    // If consent already exists and covers requested scopes, skip consent prompt
    if (existingConsent) {
      const requestedScopes = (params['scope'] as string).split(' ')
      const hasAllScopes = requestedScopes.every((scope) => existingConsent.scopes.includes(scope))

      if (hasAllScopes) {
        const provider = this.oidcService.getProvider()
        const grant = new provider.Grant({
          accountId: userId,
          clientId: params['client_id'] as string
        })

        for (const scope of existingConsent.scopes) {
          grant.addOIDCScope(scope)
        }

        const grantId = await grant.save()
        result.consent = { grantId }
      }
    }

    await this.oidcService.interactionFinished(req, res, result, { mergeWithLastSubmission: false })
  }

  private async autoGrantConsent(@Req() req: Request, @Res() res: Response, userId: string) {
    const interaction = await this.oidcService.interactionDetails(req, res)
    const { params } = interaction

    const existingConsent = await this.interactionService.getExistingConsent(
      userId,
      params['client_id'] as string
    )

    if (!existingConsent) {
      throw new Error('Cannot auto-grant: no existing consent')
    }

    const provider = this.oidcService.getProvider()
    const grant = new provider.Grant({
      accountId: userId,
      clientId: params['client_id'] as string
    })

    for (const scope of existingConsent.scopes) {
      grant.addOIDCScope(scope)
    }

    const grantId = await grant.save()

    const result = {
      consent: {
        grantId
      }
    }

    await this.oidcService.interactionFinished(req, res, result, { mergeWithLastSubmission: false })

    // Redirect happens automatically by oidc-provider
  }
}
