import { Module } from '@nestjs/common'
import { PrismaModule } from '@remlore/words-api/prisma'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

@Module({
  imports: [PrismaModule],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService]
})
export class WordsModule {}
