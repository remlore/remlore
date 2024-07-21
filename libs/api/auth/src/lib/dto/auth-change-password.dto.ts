import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator'

export class AuthChangePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsEmail()
  @IsNotEmpty()
  password!: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string
}

export class AuthChangePasswordWithTokenDto {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password!: string
}
