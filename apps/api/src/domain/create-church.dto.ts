import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'

export class CreateChurchDto {
  @ApiProperty({ example: 'Iglesia Casa de Gracia' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({
    example: 'Una comunidad de fe en el centro de la ciudad',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({
    example: 'https://storage.songlist.app/logos/abc.png',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string
}
