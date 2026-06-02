import { Test } from '@nestjs/testing'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

describe('WordsController', () => {
  let controller: WordsController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WordsService],
      controllers: [WordsController]
    }).compile()

    controller = module.get(WordsController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
