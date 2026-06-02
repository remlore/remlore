import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string

  @IsBoolean()
  remember: boolean = false
}
