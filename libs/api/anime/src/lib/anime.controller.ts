import { Controller } from '@nestjs/common'
import { AnimeService } from './anime.service'

@Controller('api-anime')
export class AnimeController {
  constructor(private apiAnimeService: AnimeService) {}
}
