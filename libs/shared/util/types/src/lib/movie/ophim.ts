export interface OphimMovieItem {
  name: string
  slug: string
  origin_name: string
  type: string
  thumbUrl: string
  posterUrl: string
  time: string
  currentEp: string
  quality: string
  lang: string
  year: number
  category: Category[]
  country: Country[]
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
