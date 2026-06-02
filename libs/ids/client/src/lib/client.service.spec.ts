import { Test } from '@nestjs/testing'
import { IdsClientService } from './ids-client.service'

describe('IdsClientService', () => {
  let service: IdsClientService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IdsClientService]
    }).compile()

    service = module.get(IdsClientService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
