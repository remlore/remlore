import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { User } from '@prisma/client'

export const UserDecorator = createParamDecorator(
  (key: keyof User | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()

    if (key) return req.user[key]

    return req.user
  }
)
