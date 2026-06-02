import { classes } from '@automapper/classes'
import { AutomapperModule } from '@automapper/nestjs'
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { AuthModule } from '@remlore/ids/auth'
import { ClientModule } from '@remlore/ids/client'
import { PrismaModule } from '@remlore/ids/core/prisma'
import { InteractionModule } from '@remlore/ids/interaction'
import { OidcModule } from '@remlore/ids/oidc'
import { join } from 'path'
import { AppController } from './app.controller'

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
          from: `No reply <${config.get<string>('MAILER_FROM')}>`
        },
        template: {
          dir: join(__dirname, './templates/mail'),
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
    AutomapperModule.forRoot({
      strategyInitializer: classes()
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*', '/interaction*', '/auth*', '/authorize*', '/token*', '/.well-known*'],
      // This ensures Angular routing works (returns index.html for all non-API routes)
      serveRoot: '/'
    }),
    OidcModule,
    AuthModule,
    ClientModule,
    PrismaModule,
    InteractionModule
  ]
})
export class AppModule {}
