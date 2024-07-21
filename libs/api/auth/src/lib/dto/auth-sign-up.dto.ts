import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class AuthSignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  username!: string

  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password!: string
}
