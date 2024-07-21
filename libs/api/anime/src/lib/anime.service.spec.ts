import { Test } from '@nestjs/testing'
import { AnimeService } from './anime.service'

describe('AnimeService', () => {
  let service: AnimeService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AnimeService]
    }).compile()

    service = module.get(AnimeService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
