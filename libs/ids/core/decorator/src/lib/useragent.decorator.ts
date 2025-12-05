import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { parse } from 'useragent'

export const Useragent = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()

  const agent = req.headers['user-agent']

  console.log('decorator', agent)
  return parse(agent)
})
