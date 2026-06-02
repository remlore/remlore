import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { HttpExceptionFilter, TransformInterceptor } from '@remlore/ids/core/interceptors'
import session from 'express-session'
import { readFileSync } from 'fs'
import passport from 'passport'
import { AppModule } from './app/app.module'

/**
 * Dynamic Client Registration: Allow clients to register dynamically.
 * Refresh Token Rotation: Use refresh tokens for long-lived sessions.
 * Multi-Factor Authentication (MFA): Integrate with TOTP or SMS-based 2FA.
 * Custom Grant Types: Implement custom OAuth2 grant types as needed.
 * Session Management: Enable RP-Initiated Logout for Single Sign-Out (SSO).
 */

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key: readFileSync('apps/rem-ids/key.pem'),
        cert: readFileSync('apps/rem-ids/cert.pem')
      }
    })

    app.use(
      session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7,
          sameSite: 'strict'
        }
      })
    )

    app.use(passport.initialize())
    app.use(passport.session())

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    app.useGlobalInterceptors(new TransformInterceptor())
    app.useGlobalFilters(new HttpExceptionFilter())

    const port = process.env['SERVER_IDS_PORT'] ?? 5000
    app.enableCors({
      origin: [process.env['IDS_FE_URL'] as string],
      credentials: true
    })

    await app.listen(port)
    Logger.log(
      `Identity Server running on https://localhost:${port}/oidc/.well-known/openid-configuration`
    )
  } catch (error) {
    Logger.error('Failed to start application', error)
    process.exit(1)
  }
}

bootstrap()
