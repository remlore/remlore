import { Test } from '@nestjs/testing'
import { AnimeController } from './anime.controller'
import { AnimeService } from './anime.service'

describe('AnimeController', () => {
  let controller: AnimeController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AnimeService],
      controllers: [AnimeController]
    }).compile()

    controller = module.get(AnimeController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
