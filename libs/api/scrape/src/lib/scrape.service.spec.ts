import { Test } from '@nestjs/testing'
import { ScrapeService } from './scrape.service'

describe('ScrapeService', () => {
  let service: ScrapeService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ScrapeService]
    }).compile()

    service = module.get(ScrapeService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
