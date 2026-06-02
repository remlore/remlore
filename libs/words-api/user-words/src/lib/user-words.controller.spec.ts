import { Test } from '@nestjs/testing'
import { UserWordsController } from './user-words.controller'
import { UserWordsService } from './user-words.service'

describe('UserWordsController', () => {
  let controller: UserWordsController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserWordsService],
      controllers: [UserWordsController]
    }).compile()

    controller = module.get(UserWordsController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
