import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class AuthChangePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsEmail()
  @IsNotEmpty()
  password!: string

  @IsString()
  @IsNotEmpty()
  @Length(200, 200)
  hash!: string
}
