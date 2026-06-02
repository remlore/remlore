import { Module, OnModuleInit } from '@nestjs/common'
import { ClientModule } from '@remlore/ids/client'
import { OidcController } from './oidc.controller'
import { OidcService } from './oidc.service'

@Module({
  imports: [ClientModule],
  controllers: [OidcController],
  providers: [OidcService],
  exports: [OidcService]
})
export class OidcModule implements OnModuleInit {
  constructor(private readonly oidcService: OidcService) {}

  async onModuleInit() {
    await this.oidcService.initialize()
  }
}
