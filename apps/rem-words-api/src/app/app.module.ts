import { classes } from '@automapper/classes'
import { AutomapperModule } from '@automapper/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiModule } from '@remlore/words-api/ai'
import { PrismaModule } from '@remlore/words-api/prisma'
import { UserModule } from '@remlore/words-api/user'
import { UserWordsModule } from '@remlore/words-api/user-words'
import { WordsModule } from '@remlore/words-api/words'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AutomapperModule.forRoot({
      strategyInitializer: classes()
    }),
    PrismaModule,
    WordsModule,
    UserWordsModule,
    UserModule,
    AiModule
  ]
})
export class AppModule {}
