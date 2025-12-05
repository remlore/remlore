// apps/your-app/src/scripts/initial-scrape.ts
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { PrismaService } from '@remlore/api/prisma'
import { ScraperService } from '@remlore/api/scrape'
import { AppModule } from '../app/app.module'

async function bootstrap() {
  const logger = new Logger('InitialScrape')
  logger.log('Starting application context...')

  const app = await NestFactory.createApplicationContext(AppModule)
  const scraperService = app.get(ScraperService)
  const prismaService = app.get(PrismaService)

  try {
    logger.log('Checking database status...')
    const movieCount = await prismaService.movie.count()

    if (movieCount > 0) {
      logger.log('Database already contains data. Exiting...')
      await app.close()
      process.exit(0)
    }

    logger.log('Starting initial data scrape...')
    await scraperService.scrapeNewMovies()

    const finalCount = await prismaService.movie.count()
    logger.log(`Initial scrape completed successfully. Movies imported: ${finalCount}`)
  } catch (error) {
    logger.error('Initial scrape failed:', error)
    process.exit(1)
  } finally {
    await prismaService.$disconnect()
    await app.close()
    process.exit(0)
  }
}

bootstrap()
