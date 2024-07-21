import { Module } from '@nestjs/common'
import { MangaController } from './manga.controller'
import { MangaService } from './manga.service'

@Module({
  controllers: [MangaController],
  providers: [MangaService],
  exports: [MangaService]
})
export class MangaModule {}
