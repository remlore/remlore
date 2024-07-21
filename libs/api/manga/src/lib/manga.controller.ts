import { Controller } from '@nestjs/common'
import { MangaService } from './manga.service'

@Controller('api-manga')
export class MangaController {
  constructor(private apiMangaService: MangaService) {}
}
