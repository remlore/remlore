import { Module } from '@nestjs/common'
import { PrismaModule } from '@remlore/words-api/prisma'
import { UserWordsController } from './user-words.controller'
import { UserWordsService } from './user-words.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserWordsController],
  providers: [UserWordsService],
  exports: [UserWordsService]
})
export class UserWordsModule {}
