import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@remlore/ids/prisma'
import { RlResponse } from '@remlore/shared/util/types'
import * as argon2 from 'argon2'
import { Request, Response } from 'express'
import {
  InjectOidcProvider,
  InteractionHelper,
  InteractionResults,
  Provider
} from 'nest-oidc-provider'
import { strict as assert } from 'node:assert'
import { SignInDto } from './dto'

@Injectable()
export class InteractionService {
  constructor(
    @InjectOidcProvider() private readonly provider: Provider,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async login(interaction: InteractionHelper, dto: SignInDto) {
    try {
      const {
        prompt: { name },
        uid
      } = await interaction.details()
      console.log('login handle', name, uid)

      if (name !== 'login') {
        throw new BadRequestException('invalid prompt name')
      }

      const user = await this.prisma.user.findFirst({
        where: { email: dto.email },
        select: {
          email: true,
          hash: true,
          id: true
        }
      })

      if (!user?.hash) {
        throw new BadRequestException('email or password is incorrect')
      }

      const pwdMatch = await argon2.verify(user.hash, dto.password, {
        secret: Buffer.from(this.config.get('ARGON2_HASH_PASSWORD') as string)
      })

      if (!pwdMatch) {
        throw new BadRequestException('email or password is incorrect')
      }

      const result: InteractionResults = {
        login: {
          accountId: user.id
        }
      }

      return interaction.finished(result, { mergeWithLastSubmission: false })
    } catch (err) {
      return console.log(err)
    }
  }

  async confirm(interaction: InteractionHelper): Promise<RlResponse<{ redirectTo: string }>> {
    try {
      const interactionDetails = await interaction.details()
      const {
        prompt: { name, details },
        params,
        session
      } = interactionDetails
      assert.equal(name, 'consent')

      let { grantId } = interactionDetails
      let grant: any

      if (grantId) {
        // we'll be modifying existing grant in existing session
        grant = await this.provider.Grant.find(grantId)
      } else {
        // we're establishing a new grant
        grant = new this.provider.Grant({
          accountId: session?.accountId,
          clientId: params['client_id'] as string
        })
      }

      if (details['missingOIDCScope']) {
        grant.addOIDCScope((details['missingOIDCScope'] as Array<string>).join(' '))
      }
      if (details['missingOIDCClaims']) {
        grant.addOIDCClaims(details['missingOIDCClaims'])
      }
      if (details['missingResourceScopes']) {
        for (const [indicator, scopes] of Object.entries(details['missingResourceScopes'])) {
          grant.addResourceScope(indicator, scopes.join(' '))
        }
      }

      grantId = await grant.save()

      const consent: { grantId?: string } = {}
      if (!interactionDetails.grantId) {
        // we don't have to pass grantId to consent, we're just modifying existing one
        consent.grantId = grantId
      }

      const result = { consent }
      const redirectTo = await interaction.result(result, { mergeWithLastSubmission: true })

      return {
        status: HttpStatus.OK,
        message: 'accept consent',
        data: {
          redirectTo
        }
      }
    } catch (err) {
      console.log(err)
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'accept consent'
      }
    }
  }

  async abort(req: Request, res: Response) {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction'
      }
      await this.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false })
    } catch (err) {
      console.log(err)
    }
  }
}
