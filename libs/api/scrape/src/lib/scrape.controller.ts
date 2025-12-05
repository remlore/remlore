import { Controller, Get, Post } from '@nestjs/common'
import { HealthCheck, RlResponse, ScrapeStatus } from '@remlore/shared/util/types'
import { ScraperService } from './scrape.service'

@Controller('scrape')
export class ScrapeController {
  constructor(private scraperService: ScraperService) {}

  @Post('initialize')
  // @UseGuards(AdminGuard) // Protect with authentication
  initializeScrape() {
    return this.scraperService.init()
  }

  @Post('update')
  // @UseGuards(AdminGuard) // Protect with authentication
  update() {
    return this.scraperService.scrapeNewMovies()
  }

  @Get('status')
  getScraperStatus(): Promise<RlResponse<ScrapeStatus>> {
    return this.scraperService.getStatus()
  }

  @Get('health')
  getHealth(): Promise<RlResponse<HealthCheck>> {
    return this.scraperService.health()
  }
}
