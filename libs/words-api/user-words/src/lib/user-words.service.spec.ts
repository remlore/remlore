import { Test } from '@nestjs/testing'
import { UserWordsService } from './user-words.service'

describe('UserWordsService', () => {
  let service: UserWordsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserWordsService]
    }).compile()

    service = module.get(UserWordsService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
