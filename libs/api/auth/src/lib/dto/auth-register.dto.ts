import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class AuthRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  rem_loreUsername!: string

  @IsString()
  @MinLength(3)
  displayName!: string
}
