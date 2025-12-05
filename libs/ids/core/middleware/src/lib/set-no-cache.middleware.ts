import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class SetNoCacheMiddleware implements NestMiddleware {
  use(_: Request, res: Response, next: NextFunction) {
    res.set('cache-control', 'no-store')
    next()
  }
}
