import { Test } from '@nestjs/testing'
import { MangaController } from './manga.controller'
import { MangaService } from './manga.service'

describe('MangaController', () => {
  let controller: MangaController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MangaService],
      controllers: [MangaController]
    }).compile()

    controller = module.get(MangaController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
