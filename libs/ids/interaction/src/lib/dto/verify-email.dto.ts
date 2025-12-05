import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class VerifyEmailDto {
  @IsString()
  @MinLength(3)
  email!: string

  @IsString()
  @IsNotEmpty()
  token!: string
}
