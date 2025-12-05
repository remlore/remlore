import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@remlore/ids/auth'
import { OidcModule, OidcService } from '@remlore/ids/core/oidc'
import { InteractionModule } from '@remlore/ids/interaction'
import { PrismaModule } from '@remlore/ids/prisma'
import { OidcModule as NestOidcModule } from 'nest-oidc-provider'
import path from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NestOidcModule.forRootAsync({
      imports: [OidcModule],
      useExisting: OidcService
    }),
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
    PrismaModule,
    InteractionModule
  ]
})
export class AppModule {}
