import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { SendMailModule } from '@remlore/ids/core/consumer'
import { OidcModule } from '@remlore/ids/oidc'
import { InteractionController } from './interaction.controller'
import { InteractionService } from './interaction.service'

@Module({
  imports: [SendMailModule, OidcModule, CacheModule.register()],
  controllers: [InteractionController],
  providers: [InteractionService],
  exports: [InteractionService]
})
export class InteractionModule {}
