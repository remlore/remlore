import { Controller } from '@nestjs/common'
import { ScrapeService } from './scrape.service'

@Controller('scrape')
export class ScrapeController {
  constructor(private apiScrapeService: ScrapeService) {}
}
