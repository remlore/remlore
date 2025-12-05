import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Agent } from 'https'
import jwksRsa from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(readonly config: ConfigService) {
    const httpsAgent = new Agent({
      rejectUnauthorized: false
      // ca: readFileSync('apps/rem-api/cert.pem')
    })
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
      audience: 'https://localhost:5000',
      issuer: 'https://localhost:5001',
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        requestAgent: httpsAgent,
        rateLimit: true,
        jwksUri: `${config.get<string>('REM_IDS_BASE_URL')}/oidc/jwks`
      })
    })
  }

  async validate(payload: any) {
    console.log(payload)
    if (payload.scope && payload.scope.includes('api.read')) {
      return { userId: payload.sub, username: payload.name, scope: payload.scope }
    }
    return false
  }
}
