import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'

export class ConsentDto {
  @IsArray()
  @IsString({ each: true })
  grantedScopes!: string[]

  @IsBoolean()
  @IsOptional()
  rememberConsent?: boolean
}
