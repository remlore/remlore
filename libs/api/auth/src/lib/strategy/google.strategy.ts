import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, config: ConfigService) {
    super({
      clientID: config.get<string>('AUTH20_CLIENT_ID'),
      clientSecret: config.get<string>('AUTH20_CLIENT_SECRET'),
      callbackURL: `${config.get<string>('SERVER_ORIGIN')}/api/v1/auth/redirect`,
      scope: ['profile', 'email']
    })
  }

  validate(_accessToken: string, _refreshToken: string | undefined, profile: Profile) {
    const user = this.authService.signInAuth20(profile)

    if (!user) throw new UnauthorizedException()

    return user
  }
}
