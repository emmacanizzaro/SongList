import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VersionType } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateSongVersionDto {
  @ApiProperty({ enum: VersionType })
  @IsEnum(VersionType)
  type!: VersionType;

  @ApiProperty({ example: "F#" })
  @IsString()
  key!: string;

  @ApiProperty({ example: "[C]Amazing [G]grace\nhow [Am]sweet the [F]sound" })
  @IsString()
  lyricsChords!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSongDto {
  @ApiProperty({ example: "Amazing Grace" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: "John Newton" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  artist?: string;

  @ApiProperty({ example: "C" })
  @IsString()
  originalKey!: string;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(300)
  bpm?: number;

  @ApiPropertyOptional({ example: ["adoracion", "clasico"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: "Versión original de la canción" })
  @IsOptional()
  version?: CreateSongVersionDto;
}
