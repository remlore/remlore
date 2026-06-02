import { Controller, Get, Headers, Param, Post } from '@nestjs/common'
import { WordsService } from './words.service'

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('daily')
  async getDailyWords(@Headers('user-id') userId: string) {
    return this.wordsService.getDailyWords(userId)
  }

  @Post('seed')
  async seedWords() {
    await this.wordsService.seedWords()
    return { message: 'Words seeded successfully' }
  }

  @Get(':id')
  async getWordDetails(@Param('id') id: string) {
    return this.wordsService.getWordDetails(id)
  }
}
