import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientService } from '@remlore/ids/client'
import { PrismaService } from '@remlore/ids/core/prisma'
import Provider, { ClientAuthMethod, ResponseType } from 'oidc-provider'
import { getOidcConfiguration } from './oidc.config'

@Injectable()
export class OidcService {
  private provider!: Provider

  constructor(
    private readonly prismaService: PrismaService,
    private readonly clientService: ClientService,
    private readonly config: ConfigService
  ) {}

  async initialize() {
    const issuer = this.config.get('IDS_URL')
    const config = getOidcConfiguration(this.prismaService)
    const clients = await this.clientService.getAllClients()

    config.clients = clients.map((client) => ({
      client_id: client.clientId,
      client_secret: client.clientSecret,
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      post_logout_redirect_uris: client.postLogoutRedirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes as ResponseType[],
      scope: client.allowedScopes.join(' '),
      token_endpoint_auth_method: client.tokenEndpointAuthMethod as ClientAuthMethod
    }))

    this.provider = new Provider(issuer, config)

    this.setupEventListeners()
  }

  getProvider(): Provider {
    return this.provider
  }

  getCallback() {
    return this.provider.callback()
  }

  private setupEventListeners() {
    // Log token issuance
    this.provider.on('access_token.issued', (token) => {
      console.log('Access token issued:', token.jti)
    })

    this.provider.on('authorization_code.consumed', (code) => {
      console.log('Authorization code consumed:', code.jti)
    })

    this.provider.on('grant.error', (ctx, error) => {
      console.error('Grant error:', error)
    })

    this.provider.on('grant.revoked', (ctx, grantId) => {
      console.log('Grant revoked:', grantId)
    })
  }

  async interactionDetails(req: any, res: any) {
    return this.provider.interactionDetails(req, res)
  }

  async interactionFinished(req: any, res: any, result: any, options?: any) {
    return this.provider.interactionFinished(req, res, result, options)
  }

  async interactionResult(req: any, res: any, result: any, options?: any) {
    return this.provider.interactionResult(req, res, result, options)
  }
}
