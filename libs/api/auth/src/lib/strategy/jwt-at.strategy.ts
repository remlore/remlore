import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { JWTEncode } from '@rem.lore/shared/util/types'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(readonly config: ConfigService, private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET')
    })
  }

  async validate(payload: Required<JWTEncode>) {
    const user = await this.authService.verifyAt(payload.sub)

    if (!user?.userId) throw new UnauthorizedException()

    return user
  }
}
