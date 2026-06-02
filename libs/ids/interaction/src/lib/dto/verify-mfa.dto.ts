import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string

  @IsString()
  @IsNotEmpty()
  code!: string

  @IsBoolean()
  remember: boolean = false
}
