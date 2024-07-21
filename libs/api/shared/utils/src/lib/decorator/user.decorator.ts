import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { UserInfo } from '@rem.lore/shared/util/types'

export const User = createParamDecorator(
  (key: keyof UserInfo | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()

    if (key) return req.user[key]

    return req.user
  }
)
