import { Test } from '@nestjs/testing'
import { WordsApiUserService } from './words-api-user.service'

describe('WordsApiUserService', () => {
  let service: WordsApiUserService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WordsApiUserService]
    }).compile()

    service = module.get(WordsApiUserService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
