import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAtGuard extends AuthGuard('jwt-at') {
  override handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('JWT Auth Error:', err, info)
      throw err || new UnauthorizedException()
    }
    return user
  }
}
