import { MailerService } from '@nest-modules/mailer'
import { Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChangePasswordJobData, OtpJobData, VerifyEmailJobData } from '@remlore/ids/shared/utils'
import { timeToString } from '@remlore/shared/util/fucns'
import { Job } from 'bull'

@Injectable()
@Processor('send-mail')
export class SendMailConsumer {
  private readonly clientOrigin = this.config.get<string>('REM_IDS_URL')
  private readonly ttlOtp = this.config.get<number>('REM_TTL_OTP')

  constructor(
    private readonly config: ConfigService,
    private readonly mailer: MailerService
  ) {}

  @Process('verify-email')
  async sendVerifyMail(job: Job<VerifyEmailJobData>) {
    console.log('consumer', job.data)
    return this.mailer.sendMail({
      to: job.data.email,
      subject: '[RemLore] - Confirm email',
      template: './confirm-email',
      context: {
        email: job.data.email,
        verifyLink: `${this.clientOrigin}/auth/confirm-email?token=${job.data.token}`
      }
    })
  }

  @Process('confirm-otp')
  async sendOtp(job: Job<OtpJobData>) {
    console.log('consumer', job.data)
    return this.mailer.sendMail({
      to: job.data.email,
      subject: `[RemLore] - ${job.data.otp} is your Remlore account confirmation code`,
      template: './confirm-email',
      context: {
        email: job.data.email,
        opt: job.data.email,
        ttl: timeToString(this.ttlOtp ?? 0)
      }
    })
  }

  @Process('change-password')
  async sendMailChangePassword(job: Job<ChangePasswordJobData>) {
    console.log('consumer', job.data)
    return this.mailer.sendMail({
      to: job.data.email,
      subject: '[RemLore] - Password Reset Request',
      template: './change-password',
      context: {
        remloreUsername: job.data.remloreUsername,
        email: job.data.email,
        changePasswordLink: `${this.clientOrigin}/auth/change-password?token=${job.data.token}`
      }
    })
  }

  @Process('mfa')
  async sendMfaCode(job: Job<{ email: string; code: string; name: string }>) {
    console.log('consumer', job.data)
    return this.mailer.sendMail({
      to: job.data.email,
      subject: '[RemLore] - MFA Code',
      template: './confirm-mfa',
      context: {
        email: job.data.email,
        code: job.data.code,
        name: job.data.name
      }
    })
  }
}
