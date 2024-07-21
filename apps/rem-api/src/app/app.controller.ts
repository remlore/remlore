import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  getData() {
    return 'rem lore api works!'
  }
}
