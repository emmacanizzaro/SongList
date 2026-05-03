import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { VersionType } from '@prisma/client'
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateSongVersionDto {
  @ApiProperty({ enum: VersionType })
  @IsEnum(VersionType)
  type!: VersionType

  @ApiProperty({ example: 'F#' })
  @IsString()
  key!: string

  @ApiProperty({ example: '[C]Amazing [G]grace\nhow [Am]sweet the [F]sound' })
  @IsString()
  lyricsChords!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string
}

export class CreateSongDto {
  @ApiProperty({ example: 'Amazing Grace' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional({ example: 'John Newton' })
  @IsOptional()
  @IsString()
  artist?: string

  @ApiProperty({ example: 'C' })
  @IsString()
  originalKey!: string

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  bpm?: number

  @ApiPropertyOptional({ example: ['adoracion', 'clasico'] })
  @IsOptional()
  tags?: string[]

  @ApiPropertyOptional({ type: CreateSongVersionDto })
  @IsOptional()
  version?: CreateSongVersionDto
}
