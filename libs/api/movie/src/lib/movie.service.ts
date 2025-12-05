import { HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/rem-api/client'
import { PrismaService } from '@remlore/api/prisma'
import { MovieSortField } from '@remlore/shared/util/constants'
import { MovieQueryDto } from './dto/movie-filter.dto'

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MovieQueryDto) {
    // async findAll(query: MovieQueryDto): Promise<RlResponse<RlPageResponse<Movie>>> {
    const { type, status, keyword, category, country, year, sort, page = 1, limit = 24 } = query
    const where: Prisma.MovieWhereInput = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (year) {
      where.publicYear = year
    }

    if (category) {
      where.categories = {
        some: {
          slug: category
        }
      }
    }

    if (country) {
      where.countries = {
        some: {
          slug: country
        }
      }
    }

    if (keyword) {
      const _keyword = decodeURIComponent(keyword)
      where.OR = [
        {
          name: {
            contains: _keyword,
            mode: 'insensitive'
          }
        },
        {
          originName: {
            contains: _keyword,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Build orderBy based on sort parameter
    const orderBy: Prisma.MovieOrderByWithRelationInput = {}

    switch (sort) {
      case MovieSortField.LastModified:
        orderBy.lastModified = 'desc'
        break
      case MovieSortField.Year:
        orderBy.publicYear = 'desc'
        break
      case MovieSortField.AddTime:
        orderBy.id = 'desc'
        break
      default:
        orderBy.lastModified = 'desc'
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalItems = await this.prisma.movie.count({ where })
    const totalPages = Math.ceil(totalItems / limit)

    // Fetch data with pagination
    const movies = await this.prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        countries: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return {
      status: HttpStatus.OK,
      items: movies.map((m) => ({
        modified: {
          time: m.lastModified
        },
        _id: m.id.toString(),
        name: m.name,
        origin_name: m.originName,
        thumb_url: m.thumbUrl,
        poster_url: m.posterUrl,
        time: m.showTime,
        episode_current: m.currentEp,
        quality: m.quality,
        slug: m.slug,
        year: m.publicYear,
        score: m.voteAverage,
        lang: m.lang,
        category: m.categories,
        country: m.countries
      })),
      pagination: {
        totalItems,
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages
      }
    }
  }

  async findBySlug(slug: string) {
    // async findBySlug(slug: string): Promise<RlResponse<Movie>> {
    const movie = await this.prisma.movie.findFirst({
      where: { slug },
      include: {
        countries: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        episodes: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    })

    if (movie) {
      const groupedEpisodes = movie.episodes.reduce((acc: any, episode) => {
        const serverName = episode.serverName

        if (!acc[serverName]) {
          acc[serverName] = { server_name: serverName, server_data: [] }
        }

        acc[serverName].server_data.push({
          name: episode.name,
          slug: episode.slug,
          filename: episode.filename,
          link_embed: episode.sourceEmbed,
          link_m3u8: episode.sourceM3u8
        })

        return acc
      }, {})

      return {
        status: HttpStatus.OK,
        movie: {
          modified: {
            time: movie.lastModified
          },
          _id: movie.id.toString(),
          name: movie.name,
          origin_name: movie.originName,
          content: movie.content,
          type: movie.type,
          status: movie.status,
          thumb_url: movie.thumbUrl,
          poster_url: movie.posterUrl,
          trailer_url: movie.trailerUrl,
          time: movie.showTime,
          episode_current: movie.currentEp,
          episode_total: movie.totalEp,
          quality: movie.quality,
          slug: movie.slug,
          lang: movie.lang,
          year: movie.publicYear,
          category: movie.categories,
          country: movie.countries
        },
        episodes: Object.values(groupedEpisodes)
      }
    }

    return {
      status: HttpStatus.NOT_FOUND
    }
  }
}
