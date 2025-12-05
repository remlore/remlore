import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RlResponse } from '@remlore/shared/util/types'
import { Response } from 'express'
import { InteractionHelper, OidcInteraction } from 'nest-oidc-provider'
import { SignInDto } from './dto'
import { InteractionService } from './interaction.service'

@Controller('interaction')
export class InteractionController {
  constructor(
    private readonly config: ConfigService,
    private readonly interactionService: InteractionService
  ) {}

  @Get(':uid')
  @HttpCode(HttpStatus.OK)
  async interaction(@OidcInteraction() interaction: InteractionHelper, @Res() res: Response) {
    const {
      prompt: { name },
      uid
    } = await interaction.details()

    if (name === 'login') {
      console.log('interaction/login')
      res.redirect(`${this.config.get('REM_IDS_FE_BASE_URL')}/auth/login/${uid}`)
    }

    if (name === 'consent') {
      // res.redirect(`${this.config.get('REM_IDS_FE_BASE_URL')}/auth/login/${uid}`)
      console.log('interaction/consent')
      res.redirect(`${this.config.get('REM_IDS_FE_BASE_URL')}/auth/consent/${uid}`)
    }

    throw new BadRequestException('invalid prompt name')
  }

  @Post(':uid/login')
  async loginCheck(@OidcInteraction() interaction: InteractionHelper, @Body() dto: SignInDto) {
    await this.interactionService.login(interaction, dto)
  }

  @Get(':uid/consent')
  async consentDetails(@OidcInteraction() interaction: InteractionHelper) {
    const {
      prompt: { name },
      params
    } = await interaction.details()

    if (name === 'consent') {
      return {
        client: params['client_id'],
        scopes: (params['scope'] as string)?.split(' ') || []
      }
    }

    throw new BadRequestException('Invalid prompt')
  }

  @Post(':uid/consent')
  async confirm(@OidcInteraction() interaction: InteractionHelper): Promise<RlResponse> {
    return this.interactionService.confirm(interaction)
  }

  @Get(':uid/abort')
  async abortLogin(@OidcInteraction() interaction: InteractionHelper) {
    const result = {
      error: 'access_denied',
      error_description: 'End-user aborted interaction'
    }

    await interaction.finished(result, { mergeWithLastSubmission: false })
  }
}
