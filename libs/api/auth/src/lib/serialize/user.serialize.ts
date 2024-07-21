import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { UserService } from '@rem.lore/api/user'
import { AuthResponse, UserInfo } from '@rem.lore/shared/util/types'
import { DoneCallback } from 'passport'

@Injectable()
export class UserSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super()
  }

  serializeUser(user: UserInfo, done: DoneCallback) {
    done(null, user)
  }

  async deserializeUser(payload: AuthResponse, done: DoneCallback) {
    if (!payload.user?.userId) return done(null, null)
    const user = await this.userService.getProfile(payload.user.userId)
    user ? done(null, user) : done(null, null)
  }
}
