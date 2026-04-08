import {
  IsString, IsDateString, IsOptional, IsBoolean,
  IsArray, IsInt, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeetingSongDto {
  @IsString()
  songId: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsString()
  keyOverride?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMeetingDto {
  @ApiProperty({ example: 'Reunión Domingo AM' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: '2026-04-19T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [CreateMeetingSongDto] })
  @IsOptional()
  @IsArray()
  songs?: CreateMeetingSongDto[];
}
