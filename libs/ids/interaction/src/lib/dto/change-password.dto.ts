import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordByOldPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  oldPassword!: string

  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  newPassword!: string
}

export class ChangePasswordByTokenDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  @Length(200, 200)
  token!: string

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  newPassword!: string
}
