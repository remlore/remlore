import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { JWTEncode } from '@rem.lore/shared/util/types'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(cs: ConfigService, private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cs.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: JWTEncode): Promise<string> {
    const accessToken = await this.authService.verifyRt(
      payload.sub,
      req.get('Authorization')?.split(' ')[1]
    )

    if (!accessToken) throw new UnauthorizedException()

    return accessToken
  }
}
