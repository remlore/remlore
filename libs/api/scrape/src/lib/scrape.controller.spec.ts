import { Test } from '@nestjs/testing'
import { ScrapeController } from './scrape.controller'
import { ScraperService } from './scrape.service'

describe('ScrapeController', () => {
  let controller: ScrapeController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ScraperService],
      controllers: [ScrapeController]
    }).compile()

    controller = module.get(ScrapeController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
