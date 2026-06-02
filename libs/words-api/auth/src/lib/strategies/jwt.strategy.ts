import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { JwtPayload } from '@remlore/shared/util/types'
import { UserService } from '@remlore/words-api/user'
import { passportJwtSecret } from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly config: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: config.get<string>('WORDS_API_URL'), // Your API identifier
      issuer: config.get<string>('IDS_URL'), // Your OIDC server URL
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `${config.get<string>('IDS_URL')}/oidc/jwks`
      })
    })
  }

  async validate(payload: JwtPayload) {
    // Extract user info from token
    const { sub, email, name, picture } = payload

    if (!sub) {
      throw new UnauthorizedException('Invalid token: missing subject')
    }

    // Get or create user in your local database
    const user = await this.userService.findOrCreateUser({
      sub,
      email,
      displayName: name,
      photoUrl: picture
    })

    // This gets attached to request.user
    return {
      id: user.id,
      sub: user.sub,
      email: user.email,
      scopes: payload.scope?.split(' ') || []
    }
  }
}
