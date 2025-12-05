import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {
    console.log(config.get('NODE_ENV'))
  }

  @Get()
  getData() {
    return 'app ids works'
  }
}
