import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AnimeModule } from '@remlore/api/anime'
import { AuthModule } from '@remlore/api/auth'
import { MangaModule } from '@remlore/api/manga'
import { MovieModule } from '@remlore/api/movie'
import { PrismaModule } from '@remlore/api/prisma'
import { ScrapeModule } from '@remlore/api/scrape'
import { UserModule } from '@remlore/api/user'
import path from 'path'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    PassportModule.register({ session: true }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAILER_HOST'),
          secure: false,
          auth: {
            user: config.get<string>('MAILER_USER'),
            pass: config.get<string>('MAILER_PASSWORD')
          }
        },
        defaults: {
          from: `"No reply" <${config.get<string>('MAILER_FROM')}>`
        },
        template: {
          dir: path.join(__dirname, './templates/mail'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379
      }
    }),
    AuthModule,
    AnimeModule,
    ScrapeModule,
    MangaModule,
    MovieModule,
    UserModule,
    PrismaModule
  ],
  controllers: [AppController]
})
export class AppModule {}
