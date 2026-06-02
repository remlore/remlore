import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { UAParser } from 'ua-parser-js'

export const Useragent = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()

  const userAgent = req.headers['user-agent']

  if (!userAgent) return

  const parser = new UAParser(userAgent)

  return parser.getResult()
})
