import { AutoMap } from '@automapper/classes'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class SignUpDto {
  @IsString()
  @MinLength(3)
  displayName?: string

  @IsEmail()
  @IsNotEmpty()
  @AutoMap()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @AutoMap()
  password!: string

  @IsString()
  @IsOptional()
  @AutoMap()
  deviceId!: string
}
