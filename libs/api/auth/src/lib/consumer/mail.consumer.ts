import { MailerService } from '@nest-modules/mailer'
import { Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Job } from 'bull'

@Injectable()
@Processor('send-mail')
export class MailConsumer {
  private readonly clientOrigin = this.config.get<string>('CLIENT_ORIGIN')

  constructor(private readonly config: ConfigService, private readonly mailer: MailerService) {}

  @Process('verify-email')
  async sendVerifyMail(job: Job<{ email: string; verifyhash: string }>) {
    return this.mailer.sendMail({
      to: job.data.email,
      subject: 'hello ' + job.data.email,
      template: './confirm-email',
      context: {
        email: job.data.email,
        verifyLink: `${this.clientOrigin}/auth/confirm-email?hash=${job.data.verifyhash}`
      }
    })
  }
}
