export interface HealthCheck {
  lastCompleteScrape: Date | null | undefined
  movieCount: number
  moviesScrapedToday: number
}
