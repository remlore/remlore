import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { readFileSync } from 'fs'
import { AppModule } from './app/app.module'

/**
 * Dynamic Client Registration: Allow clients to register dynamically.
 * Refresh Token Rotation: Use refresh tokens for long-lived sessions.
 * Multi-Factor Authentication (MFA): Integrate with TOTP or SMS-based 2FA.
 * Custom Grant Types: Implement custom OAuth2 grant types as needed.
 * Session Management: Enable RP-Initiated Logout for Single Sign-Out (SSO).
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: readFileSync('apps/rem-ids/key.pem'),
      cert: readFileSync('apps/rem-ids/cert.pem')
    }
  })

  const port = process.env['SERVER_IDS_PORT'] ?? 5000
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.enableCors({
    origin: [process.env['REM_IDS_FE_BASE_URL'] as string, process.env['REM_BASE_URL'] as string],
    credentials: true
  })
  await app.listen(port)

  Logger.log(`Identity Server running on http://localhost:${port}/oidc`)
}
bootstrap()
