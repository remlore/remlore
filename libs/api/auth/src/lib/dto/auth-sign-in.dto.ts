import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class AuthSignInDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  usernameOrEmail?: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string
}
