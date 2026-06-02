import { Test } from '@nestjs/testing'
import { WordsService } from './words.service'

describe('WordsService', () => {
  let service: WordsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WordsService]
    }).compile()

    service = module.get(WordsService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
