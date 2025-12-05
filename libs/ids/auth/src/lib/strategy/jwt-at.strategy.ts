import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { JWTEncode } from '@remlore/shared/util/types'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET')
    })
  }

  async validate(payload: Required<JWTEncode>) {
    if (!payload?.sub) throw new UnauthorizedException()

    return payload
  }
}
