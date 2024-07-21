import { Test } from '@nestjs/testing'
import { MangaService } from './manga.service'

describe('MangaService', () => {
  let service: MangaService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MangaService]
    }).compile()

    service = module.get(MangaService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
