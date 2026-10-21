import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsHexadecimal, IsString, Length, MaxLength, MinLength } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({ example: 'juan@miglesia.com' })
  @IsEmail()
  email: string
}

export class TokenDto {
  @ApiProperty({ description: 'Token recibido por email' })
  @IsHexadecimal()
  @Length(64, 64)
  token: string
}

export class ResetPasswordDto extends TokenDto {
  @ApiProperty({ example: 'NuevaPassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string
}
