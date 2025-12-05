export interface ScrapeStatus {
  status: 'completed' | 'not-started' | 'in-progress'
  progress: string
  movieCount: number
  startedAt: Date | null | undefined
  completedAt: Date | null | undefined
}
