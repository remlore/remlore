import { Test } from '@nestjs/testing'
import { OidcService } from './oidc.service'

describe('OidcService', () => {
  let service: OidcService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OidcService]
    }).compile()

    service = module.get(OidcService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
