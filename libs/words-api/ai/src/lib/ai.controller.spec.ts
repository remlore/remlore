import { Test } from '@nestjs/testing'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'

describe('AiController', () => {
  let controller: AiController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AiService],
      controllers: [AiController]
    }).compile()

    controller = module.get(AiController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
