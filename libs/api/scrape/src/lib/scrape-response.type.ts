import { Maybe } from '@remlore/shared/util/types'

export interface ScrapeMovieListResponse {
  status: boolean
  items: ScrapeMovieItem[]
  pathImage: string
  pagination: ScrapeMoviePagination
}

export interface ScrapeMovieItem {
  tmdb: Tmdb
  _id: string
  name: string
  slug: string
  origin_name: string
  thumb_url: string
  poster_url: string
  modified: {
    time: Date
  }
  year: number
}

export interface ScrapeMoviePagination {
  totalItems: number
  totalItemsPerPage: number
  currentPage: number
  totalPages: number
}

export interface ScrapeMovieDetailResponse {
  status: boolean
  msg: string
  movie: ScrapeMovieDetail
  episodes: Episode[]
}

export interface ScrapeMovieDetail {
  _id: string
  tmdb: Tmdb
  name: string
  origin_name: string
  content: string
  type: 'single' | 'series' | 'tvshows' | 'hoathinh'
  status: 'completed' | 'trailer' | 'ongoing'
  thumb_url: string
  trailer_url: string
  time: string
  episode_current: string
  episode_total: string
  quality: string
  lang: string
  notify: string
  showtimes: string
  slug: string
  year: number
  view: number
  actor: string[]
  director: string[]
  category: Category[]
  country: Country[]
  is_copyright: boolean
  chieurap: boolean
  poster_url: string
  sub_docquyen: boolean
  modified: {
    time: Date
  }
  created: {
    time: Date
  }
}

export interface Tmdb {
  type: 'single' | 'series'
  id: string
  season: Maybe<number>
  vote_average: number
  vote_count: number
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Country {
  id: string
  name: string
  slug: string
}

export interface Episode {
  server_name: string
  server_data: Server[]
}

export interface Server {
  name: string
  slug: string
  filename: string
  link_embed: string
  link_m3u8: string
}
