import { EGender } from '@prisma/client'
import { IsEnum, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'

export class UserRegisterRemloreDto {
  @IsString()
  @MinLength(3)
  displayName?: string

  @IsString()
  @IsUrl()
  photoUrl?: string

  @IsString()
  @IsUrl()
  backgroundUrl?: string

  @IsEnum(EGender)
  gender?: EGender

  @IsString()
  @MaxLength(400)
  bio?: string

  @IsString()
  @MaxLength(400)
  birthday?: string
}
