import { HttpStatus } from '@nestjs/common'

export type RemloreStatus = HttpStatus

export type RlResponseWithData<T, K extends string = 'data'> = { [P in K]: T } & {
  success: boolean
  message?: string
  error?: any
}

export interface RlResponseNoData {
  success: boolean
  message?: string
  error?: any
}

export type RlResponse<T = undefined, K extends string = 'data'> = T extends undefined
  ? RlResponseNoData
  : RlResponseWithData<T, K>

export type RlPageResponse<T, K extends string = 'items'> = { [P in K]: T[] } & {
  totalPages: number
  currentPage: number
  totalItems: number
  batch: number
}
