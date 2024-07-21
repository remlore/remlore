import { IsString, IsUrl, MinLength } from 'class-validator'

export class UserRegisterRemloreDto {
  @IsString()
  @MinLength(3)
  displayName?: string

  @IsString()
  @IsUrl()
  photoUrl?: string
}
