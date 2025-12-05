import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import jwksRsa from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `${config.get<string>('REM_IDS_BASE_URL')}/oidc/jwks`
      })
    })
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('JWT Auth Error:', err, info)
      throw err || new UnauthorizedException()
    }
    return user
  }

  async validate(payload: any) {
    if (payload.scope && payload.scope.includes('api.read')) {
      return { userId: payload.sub, username: payload.name, scope: payload.scope }
    }
    return false
  }
}
