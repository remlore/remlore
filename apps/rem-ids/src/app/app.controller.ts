import { Controller, Get } from '@nestjs/common'

@Controller('/')
export class AppController {
  @Get()
  getData() {
    return 'app ids works!!!'
  }
}
