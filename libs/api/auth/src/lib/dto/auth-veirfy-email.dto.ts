import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class AuthVerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  hash!: string

  @IsEmail()
  @IsNotEmpty()
  email!: string
}
