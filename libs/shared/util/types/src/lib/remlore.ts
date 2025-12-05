import { HttpStatus } from '@nestjs/common'

export type RemloreStatus = HttpStatus

interface RlResponseWithData<T> {
  status: RemloreStatus
  message?: string
  data?: T
}

interface RlResponseNoData {
  status: RemloreStatus
  message?: string
}

export type RlResponse<T = undefined> = T extends undefined
  ? RlResponseNoData
  : RlResponseWithData<T>

export interface RlPageResponse<T> {
  totalPages: number
  currentPage: number
  totalItems: number
  batch: number
  items: T[]
}
