import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(readonly config: ConfigService) {
    const pool = new PrismaPg({ connectionString: config.get<string>('DATABASE_URL') })
    super({ adapter: pool })
  }
}
