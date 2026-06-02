import { InjectQueue } from '@nestjs/bull'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService, User } from '@remlore/ids/core/prisma'
import { MfaCache, PendingEmailVerification } from '@remlore/ids/shared/utils'
import { RlResponse } from '@remlore/shared/util/types'
import * as argon2 from 'argon2'
import { Queue } from 'bull'
import * as crypto from 'crypto'

@Injectable()
export class InteractionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectQueue('send-mail') private readonly mailQueue: Queue
  ) {}

  async login() {}

  async validateLogin(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email }
    })

    if (!user?.passwordHash) {
      throw new BadRequestException('email or password is incorrect')
    }

    const pwdMatch = await argon2.verify(user.passwordHash, password, {
      secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
    })

    if (!pwdMatch) {
      throw new BadRequestException('email or password is incorrect')
    }

    return user
  }

  // async confirm(interaction: Interaction): Promise<RlResponse<{ redirectTo: string }>> {
  //   try {
  //     const {
  //       prompt: { name, details },
  //       params,
  //       session,
  //     } = interaction

  //     let { grantId } = interaction
  //     let grant: any
  //     const provider = this.oidcService.getProvider()

  //     if (grantId) {
  //       // we'll be modifying existing grant in existing session
  //       grant = await provider.Grant.find(grantId)
  //     } else {
  //       // we're establishing a new grant
  //       grant = new provider.Grant({
  //         accountId: session?.accountId,
  //         clientId: params['client_id'] as string
  //       })
  //     }

  //     if (details['missingOIDCScope']) {
  //       grant.addOIDCScope((details['missingOIDCScope'] as Array<string>).join(' '))
  //     }
  //     if (details['missingOIDCClaims']) {
  //       grant.addOIDCClaims(details['missingOIDCClaims'])
  //     }
  //     if (details['missingResourceScopes']) {
  //       for (const [indicator, scopes] of Object.entries(details['missingResourceScopes'])) {
  //         grant.addResourceScope(indicator, scopes.join(' '))
  //       }
  //     }

  //     grantId = await grant.save()

  //     const consent: { grantId?: string } = {}
  //     if (!interaction.grantId) {
  //       // we don't have to pass grantId to consent, we're just modifying existing one
  //       consent.grantId = grantId
  //     }

  //     const result = { consent }
  //     const redirectTo = await this.oidcService.interactionResult(result, { mergeWithLastSubmission: true })

  //     return {
  //       success: true,
  //       message: 'accept consent',
  //       data: {
  //         redirectTo
  //       }
  //     }
  //   } catch (err) {
  //     console.log(err)
  //     throw new BadRequestException('Failed to confirm consent')
  //   }
  // }

  // async abort(req: Request, res: Response) {
  //   try {
  //     const result = {
  //       error: 'access_denied',
  //       error_description: 'End-User aborted interaction'
  //     }
  //     await this.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false })
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  async getClientInfo(accountId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        displayName: true,
        profile: {
          select: { photoUrl: true }
        }
      }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.profile?.photoUrl ?? null
    }
  }

  async generateMfaCode(userId: string): Promise<string> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const tempToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store in cache
    this.cache.set(tempToken, {
      userId,
      code,
      expiresAt
    })

    // Get user email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true }
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    // Send email
    // await this.emailService.sendMfaCode(user.email, code, user.displayName)
    await this.mailQueue.add(
      'verify-email',
      { email: user.email, code, name: user.displayName },
      { removeOnComplete: true }
    )

    return tempToken
  }

  async verifyMfaCode(tempToken: string, code: string): Promise<RlResponse<string>> {
    const mfaData = await this.cache.get<MfaCache>(tempToken)

    if (!mfaData) {
      throw new BadRequestException('Invalid MFA token')
    }

    if (new Date() > mfaData.expiresAt) {
      this.cache.del(tempToken)
      throw new BadRequestException('MFA code has expired')
    }

    if (mfaData.code !== code) {
      throw new BadRequestException('Invalid MFA code')
    }

    // Remove used code
    this.cache.del(tempToken)

    return {
      success: true,
      data: mfaData.userId
    }
  }

  async getExistingConsent(userId: string, clientId: string) {
    const consent = await this.prisma.consent.findUnique({
      where: {
        userId_clientId: { userId, clientId }
      }
    })

    // Return null if expired
    if (consent && consent.expiresAt && consent.expiresAt <= new Date()) {
      return null
    }

    return consent ?? null
  }

  async createPendingVerification(userId: string, interactionUid: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    this.cache.set<PendingEmailVerification>(token, {
      userId,
      interactionUid,
      expiresAt
    })

    return token
  }

  async getPendingVerification(
    token: string
  ): Promise<{ userId: string; interactionUid: string } | null> {
    const pending = await this.cache.get<PendingEmailVerification>(token)

    if (!pending) {
      return null
    }

    if (new Date() > pending.expiresAt) {
      this.cache.del(token)
      return null
    }

    // Delete after retrieval (one-time use)
    this.cache.del(token)

    return {
      userId: pending.userId,
      interactionUid: pending.interactionUid
    }
  }

  async saveConsent(userId: string, clientId: string, scopes: string[]) {
    // Set expiration to 1 year from now
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    return this.prisma.consent.upsert({
      where: { userId_clientId: { userId, clientId } },
      create: { userId, clientId, scopes, expiresAt },
      update: { scopes, expiresAt, grantedAt: new Date() }
    })
  }
}
