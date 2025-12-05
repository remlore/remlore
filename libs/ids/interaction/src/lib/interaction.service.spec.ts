import { Test } from '@nestjs/testing'
import { InteractionService } from './interaction.service'

describe('InteractionService', () => {
  let service: InteractionService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [InteractionService]
    }).compile()

    service = module.get(InteractionService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
