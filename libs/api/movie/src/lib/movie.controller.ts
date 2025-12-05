import { Controller, Get, Param, Query } from '@nestjs/common'
import { MovieQueryDto } from './dto/movie-filter.dto'
import { MovieService } from './movie.service'

@Controller('movie')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get()
  async findAllByType(@Query() query: MovieQueryDto) {
    return this.movieService.findAll(query)
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.movieService.findBySlug(slug)
  }
}
