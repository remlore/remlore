import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthSignInDto } from './dto/auth-sign-in.dto'

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService],
      controllers: [AuthController]
    }).compile()

    controller = module.get(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })

  describe('sign in', () => {
    it('should sign in mock', () => {
      const body: AuthSignInDto = {
        diplayname: 'Nguyen',
        email: 'trungnguyen@email.com',
        password: '123',
        username: 'trungnguyen'
      }

      return pactum
        .spec()
        .post('api/v2/auth/sign-in')
        .withBody(body)
        .expectStatus(200)
        .expectJson(body)

      // expect(controller.signIn(body)).toEqual(body)
    })
  })
})
