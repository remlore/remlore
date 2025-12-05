import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { EMovieType } from '@prisma/rem-api/client'
import { PrismaService } from '@remlore/api/prisma'
import { HealthCheck, RlResponse, ScrapeStatus } from '@remlore/shared/util/types'
import { firstValueFrom } from 'rxjs'
import { ScrapeMovieDetailResponse, ScrapeMovieListResponse } from './scrape-response.type'

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  @Cron('0 */6 * * *') // 6h
  async scheduledScrape() {
    try {
      await this.scrapeNewMovies()
    } catch (error) {
      this.logger.error('Scheduled scrape failed', error)
    }
  }

  @Cron('0 12 * * *') // Daily at noon
  async scheduledUpdate() {
    try {
      await this.updateExistingMovies()
    } catch (error) {
      this.logger.error('Scheduled update failed', error)
    }
  }

  private readonly API_BASE = this.configService.get<string>('OPHIM1_BASE_RUL')

  async fetchMoviesList(page: number): Promise<ScrapeMovieListResponse> {
    await this.delay(1000) // Rate limiting

    const response = await firstValueFrom(
      this.httpService.get(`${this.API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`)
    )

    return response.data
  }

  async fetchMovieDetail(slug: string): Promise<ScrapeMovieDetailResponse> {
    await this.delay(100) // Rate limiting

    const response = await firstValueFrom(this.httpService.get(`${this.API_BASE}/phim/${slug}`))

    return response.data
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async scrapeNewMovies() {
    // Get scraping status
    let status = await this.prisma.scrapeStatus.findFirst({
      where: { isCompleted: false },
      orderBy: { startedAt: 'desc' }
    })

    // Initialize new scrape job if needed
    if (!status) {
      const firstPage = await this.fetchMoviesList(1)
      const totalPages = firstPage.pagination.totalPages

      status = await this.prisma.scrapeStatus.create({
        data: {
          lastPageScraped: 0,
          totalPages,
          isCompleted: false
        }
      })

      this.logger.log(`Starting new scrape job. Total pages: ${totalPages}`)
    }

    // Process batch of pages (e.g., 5 at a time to reduce load)
    const startPage = status.lastPageScraped + 1
    const endPage = Math.min(startPage + 4, status.totalPages)

    this.logger.log(`Processing pages ${startPage} to ${endPage}`)

    for (let page = startPage; page <= endPage; page++) {
      await this.processMoviesListPage(page)

      // Update progress
      await this.prisma.scrapeStatus.update({
        where: { id: status.id },
        data: { lastPageScraped: page }
      })
    }

    // Check if completed
    if (endPage >= status.totalPages) {
      await this.prisma.scrapeStatus.update({
        where: { id: status.id },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      })
      this.logger.log('Scrape job completed successfully')
    }
  }

  async updateExistingMovies() {
    // Get recently modified movies (e.g., last 3 days)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const moviesToUpdate = await this.prisma.movie.findMany({
      where: {
        lastScraped: { lt: threeDaysAgo }
      },
      select: { slug: true },
      orderBy: { lastScraped: 'asc' },
      take: 100 // Limit batch size
    })

    this.logger.log(`Updating ${moviesToUpdate.length} existing movies`)

    for (const movie of moviesToUpdate) {
      await this.processMovieDetail(movie.slug)
    }
  }

  private async processMoviesListPage(page: number) {
    try {
      this.logger.debug(`Processing pages: ${page}`)
      const data = await this.fetchMoviesList(page)
      for (const item of data.items) {
        const existingMovie = await this.prisma.movie.findUnique({
          where: { scrapeId: item._id },
          select: { id: true, lastModified: true }
        })

        const itemModified = new Date(item.modified.time)

        if (existingMovie && existingMovie.lastModified >= itemModified) {
          continue
        }

        await this.processMovieDetail(item.slug)
      }
    } catch (error) {
      this.logger.error(`Error processing page ${page}:`, error)
    }
  }

  private async processMovieDetail(slug: string) {
    try {
      const data = await this.fetchMovieDetail(slug)
      const movieData = data.movie
      let type: EMovieType = movieData.type

      await this.prisma.$transaction(async (tx) => {
        const categoryConnections = await Promise.all(
          (movieData.category || []).map(async (cat) => {
            const _cat = await tx.category.upsert({
              where: { scrapeId: cat.id },
              update: { name: cat.name, slug: cat.slug },
              create: { scrapeId: cat.id, name: cat.name, slug: cat.slug }
            })
            return { id: _cat.id }
          })
        )

        const countryConnections = await Promise.all(
          (movieData.country || []).map(async (country) => {
            if (country.slug === 'nhat-ban') {
              type = 'anime'
            }
            const _country = await tx.country.upsert({
              where: { scrapeId: country.id },
              update: { name: country.name, slug: country.slug },
              create: { scrapeId: country.id, name: country.name, slug: country.slug }
            })
            return { id: _country.id }
          })
        )

        const movie = await tx.movie.upsert({
          where: { scrapeId: movieData._id },
          update: {
            name: movieData.name,
            slug: movieData.slug,
            originName: movieData.origin_name,
            content: movieData.content,
            type: type,
            status: movieData.status,
            thumbUrl: movieData.thumb_url,
            posterUrl: movieData.poster_url,
            trailerUrl: movieData.trailer_url,
            quality: movieData.quality,
            lang: movieData.lang,
            showTime: movieData.time,
            currentEp: movieData.episode_current,
            totalEp: movieData.episode_total,
            publicYear: movieData.year,
            view: movieData.view,
            movieTheater: movieData.chieurap,
            lastModified: new Date(movieData.modified.time),
            lastScraped: new Date(),

            categories: { set: [], connect: categoryConnections as [] },
            countries: { set: [], connect: countryConnections as [] }
          },
          create: {
            scrapeId: movieData._id,
            name: movieData.name,
            slug: movieData.slug,
            originName: movieData.origin_name,
            content: movieData.content,
            type: type,
            status: movieData.status,
            thumbUrl: movieData.thumb_url,
            posterUrl: movieData.poster_url,
            trailerUrl: movieData.trailer_url,
            quality: movieData.quality,
            lang: movieData.lang,
            showTime: movieData.time,
            currentEp: movieData.episode_current,
            totalEp: movieData.episode_total,
            publicYear: movieData.year,
            view: movieData.view,
            movieTheater: movieData.chieurap,
            createdDate: movieData.created?.time ? new Date(movieData.created.time) : undefined,
            lastModified: new Date(movieData.modified.time),

            categories: { connect: categoryConnections as [] },
            countries: { connect: countryConnections as [] }
          },
          include: { episodes: true }
        })

        if (movie.episodes.length > 0) {
          await tx.episode.deleteMany({
            where: { movieId: movie.id }
          })
        }

        // Add new episodes
        for (const server of data.episodes) {
          for (const ep of server.server_data) {
            await tx.episode.create({
              data: {
                name: ep.name,
                slug: ep.slug,
                serverName: server.server_name,
                filename: ep.filename,
                sourceEmbed: ep.link_embed,
                sourceM3u8: ep.link_m3u8,
                movieId: movie.id
              }
            })
          }
        }
      })

      this.logger.debug(`Processed movie: ${slug}`)
    } catch (error) {
      this.logger.error(`Error processing movie ${slug}:`, error)
      // Implement retry mechanism
    }
  }

  async health(): Promise<RlResponse<HealthCheck>> {
    const lastSuccessfulScrape = await this.prisma.scrapeStatus.findFirst({
      where: { isCompleted: true },
      orderBy: { completedAt: 'desc' }
    })

    const moviesToday = await this.prisma.movie.count({
      where: { lastScraped: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    })

    return {
      status: HttpStatus.OK,
      data: {
        lastCompleteScrape: lastSuccessfulScrape?.completedAt,
        movieCount: await this.prisma.movie.count(),
        moviesScrapedToday: moviesToday
      }
    }
  }

  async init() {
    const movieCount = await this.prisma.movie.count()

    // if (movieCount > 0) {
    //   throw new BadRequestException(
    //     'Database already contains movies. Initialize only works on empty database.'
    //   )
    // }

    this.scrapeNewMovies()

    return { message: 'Initial scrape started successfully' }
  }

  async getStatus(): Promise<RlResponse<ScrapeStatus>> {
    const status = await this.prisma.scrapeStatus.findFirst({
      orderBy: { startedAt: 'desc' }
    })

    const movieCount = await this.prisma.movie.count()

    return {
      status: HttpStatus.OK,
      data: {
        status: status ? (status.isCompleted ? 'completed' : 'in-progress') : 'not-started',
        progress: status ? `${status.lastPageScraped}/${status.totalPages} pages processed` : 'N/A',
        movieCount,
        startedAt: status?.startedAt,
        completedAt: status?.completedAt
      }
    }
  }
}
