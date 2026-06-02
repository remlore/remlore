import { Controller } from '@nestjs/common'
import { AiService } from './ai.service'

@Controller('words-api-ai')
export class AiController {
  constructor(private AiService: AiService) {}
}
