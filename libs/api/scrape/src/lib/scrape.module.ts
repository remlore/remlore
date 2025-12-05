import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ScrapeController } from './scrape.controller'
import { ScraperService } from './scrape.service'

@Module({
  controllers: [ScrapeController],
  providers: [ScraperService],
  imports: [HttpModule]
})
export class ScrapeModule {}
