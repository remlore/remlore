import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class SignInDto {
  @IsString()
  @MinLength(3)
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string
}
