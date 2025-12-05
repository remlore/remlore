// import { Injectable } from '@nestjs/common'
// import { PassportSerializer } from '@nestjs/passport'
// import { UserService } from '@remlore/api/user'
// import { AuthResponse, UserInfo } from '@remlore/shared/util/types'
// import { DoneCallback } from 'passport'

// @Injectable()
// export class UserSerializer extends PassportSerializer {
//   constructor(private readonly userService: UserService) {
//     super()
//   }

//   serializeUser(user: UserInfo, done: DoneCallback) {
//     console.log('serializeUser', user)
//     done(null, user)
//   }

//   async deserializeUser(payload: AuthResponse, done: DoneCallback) {
//     console.log('serialize', payload.user)
//     if (!payload.user?.id) return done(null, null)
//     const user = await this.userService.getProfile(payload.user.id)
//     return done(null, user)
//   }
// }
