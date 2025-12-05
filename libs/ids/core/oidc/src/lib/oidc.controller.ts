import { All, Controller, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { InjectOidcProvider, Provider } from 'nest-oidc-provider'

@Controller('oidc')
export class OidcController {
  constructor(@InjectOidcProvider() private readonly provider: Provider) {}

  @All('/*')
  mountedOidc(@Req() req: Request, @Res() res: Response) {
    req.url = req.originalUrl.replace('/oidc', '')
    const callback = this.provider.callback()
    return callback(req, res)
  }
}
