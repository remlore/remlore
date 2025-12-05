import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import session from 'express-session'

import { readFileSync } from 'fs'
import passport from 'passport'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync('apps/rem-api/key.pem'),
      cert: readFileSync('apps/rem-api/cert.pem')
    }
  })
  const globalPrefix = 'api'

  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI })
  app.use(
    session({
      secret: 'the secret',
      saveUninitialized: false,
      resave: false,
      cookie: { maxAge: 60000 }
    })
  )
  app.use(passport.initialize())
  app.enableCors({
    origin: ['https://localhost:4200'],
    credentials: true
  })

  const port = process.env.PORT || 5000

  await app.listen(port)

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap()
