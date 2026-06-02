import { All, Controller, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { OidcService } from './oidc.service'

@Controller('oidc')
export class OidcController {
  constructor(private readonly oidcService: OidcService) {}

  // Handle all OIDC routes
  @All([
    '/authorize',
    '/token',
    '/userinfo',
    '/revoke',
    '/introspect',
    '/jwks',
    '/.well-known/openid-configuration',
    '/end_session',
    '/code_verification',
    '/device'
  ])
  async oidcRoutes(@Req() req: Request, @Res() res: Response) {
    const callback = this.oidcService.getProvider().callback()
    await callback(req, res)
  }

  // @All('/*')
  // mountedOidc(@Req() req: Request, @Res() res: Response) {
  //   req.url = req.originalUrl.replace('/oidc', '')
  //   const callback = this.oidcService.getProvider().callback()
  //   return callback(req, res)
  // }
}
