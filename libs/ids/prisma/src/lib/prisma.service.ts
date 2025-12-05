import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/rem-ids/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      // log: [
      //   {
      //     emit: 'stdout',
      //     level: 'query'
      //   }
      // ],
      datasources: {
        db: {
          url: config.get('REM_IDS_DB_URL')
        }
      }
    })
  }
}
