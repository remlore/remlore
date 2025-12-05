import { Test } from '@nestjs/testing'
import { InteractionController } from './interaction.controller'
import { InteractionService } from './interaction.service'

describe('InteractionController', () => {
  let controller: InteractionController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [InteractionService],
      controllers: [InteractionController]
    }).compile()

    controller = module.get(InteractionController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
