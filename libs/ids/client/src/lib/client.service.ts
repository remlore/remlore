import { Injectable } from '@nestjs/common'
import { PrismaService } from '@remlore/ids/core/prisma'
import * as crypto from 'crypto'

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllClients() {
    return this.prisma.client.findMany()
  }

  async getClientById(clientId: string) {
    return this.prisma.client.findUnique({
      where: { clientId }
    })
  }

  async createClient(data: {
    clientName: string
    redirectUris: string[]
    postLogoutRedirectUris?: string[]
    allowedScopes?: string[]
    grantTypes?: string[]
    responseTypes?: string[]
    tokenEndpointAuthMethod?: string
  }) {
    const clientId = crypto.randomBytes(16).toString('hex')
    const clientSecret = crypto.randomBytes(32).toString('hex')

    return this.prisma.client.create({
      data: {
        clientId,
        clientSecret,
        clientName: data.clientName,
        redirectUris: data.redirectUris,
        postLogoutRedirectUris: data.postLogoutRedirectUris || [],
        allowedScopes: data.allowedScopes || ['openid', 'profile', 'email'],
        grantTypes: data.grantTypes || ['authorization_code', 'refresh_token'],
        responseTypes: data.responseTypes || ['code'],
        tokenEndpointAuthMethod: data.tokenEndpointAuthMethod || 'client_secret_basic'
      }
    })
  }
}
