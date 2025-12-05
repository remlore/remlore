import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { SendMailConsumer } from './send-mail.consumer'

@Module({
  imports: [BullModule.registerQueue({ name: 'send-mail' })],
  providers: [SendMailConsumer],
  exports: [SendMailConsumer, BullModule]
})
export class SendMailModule {}
