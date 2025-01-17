import { Module } from '@nestjs/common'
import { ScrapeController } from './scrape.controller'
import { ScrapeService } from './scrape.service'

@Module({
  controllers: [ScrapeController],
  providers: [ScrapeService],
  exports: [ScrapeService]
})
export class ScrapeModule {}
