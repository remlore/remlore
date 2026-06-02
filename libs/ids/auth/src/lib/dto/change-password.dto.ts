import { AutoMap } from '@automapper/classes'
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordByOldPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @AutoMap()
  oldPassword!: string

  @IsEmail()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @AutoMap()
  newPassword!: string
}

export class ChangePasswordByTokenDto {
  @IsEmail()
  @IsNotEmpty()
  @AutoMap()
  email!: string

  @IsString()
  @IsNotEmpty()
  @Length(200, 200)
  @AutoMap()
  token!: string

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @AutoMap()
  newPassword!: string
}
