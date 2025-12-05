import { EMovieStatus, EMovieType } from '@prisma/rem-api/client'
import { MovieSortField } from '@remlore/shared/util/constants'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class MovieQueryDto {
  @IsOptional()
  @IsString()
  type?: EMovieType

  @IsOptional()
  @IsString()
  status?: EMovieStatus

  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number

  @IsOptional()
  @IsEnum(MovieSortField)
  sort?: MovieSortField = MovieSortField.LastModified

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 24
}
