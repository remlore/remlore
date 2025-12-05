import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import JwksRsa, { JwksClient } from 'jwks-rsa'

@Injectable()
export class OidcJwtAuthGuard implements CanActivate {
  private jwksClient: JwksClient

  constructor(private config: ConfigService) {
    const clientConfig: JwksRsa.Options = {
      jwksUri: `${this.config.get('REM_IDS_BASE_URL')}/oidc/jwks`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000
    }
    console.log(clientConfig)
    this.jwksClient = new JwksClient(clientConfig)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      request.user = await this.validateToken(token)
      console.log(request.user)
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null

    return parts[1]
  }

  private async validateToken(token: string) {
    const decodedToken = jwt.decode(token, { complete: true })

    if (!decodedToken) throw new Error('Invalid token')

    const kid = decodedToken.header.kid
    // const key = await this.jwksClient.getSigningKey(kid) // it error here
    // console.log('key', key)
    // const signingKey = key.getPublicKey()
    // console.log('signingKey', signingKey)
    try {
      const key = await this.jwksClient.getSigningKey(kid)
      console.log('Key found:', key)

      const signingKey = key.getPublicKey()

      return new Promise((resolve, reject) => {
        jwt.verify(
          token,
          signingKey,
          {
            audience: 'https://localhost:5000'
          },
          (err, decoded) => {
            if (err) {
              console.log('Verification error:', err)
              return reject(err)
            }
            resolve(decoded)
          }
        )
      })
    } catch (keyError) {
      console.log('Error getting signing key:', keyError)

      // Debug: Fetch and log all available keys
      try {
        const keys = (await this.jwksClient.getKeys()) as any[]
        console.log(
          'Available keys:',
          keys.map((k) => k.kid)
        )
      } catch (e) {
        console.log('Error getting all keys:', e)
      }

      throw new Error(`Unable to find key with ID: ${kid}`)
    }
  }
}
