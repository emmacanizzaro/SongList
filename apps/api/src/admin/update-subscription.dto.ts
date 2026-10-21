import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PlanType } from '@prisma/client'
import { IsDateString, IsEnum, IsOptional, ValidateIf } from 'class-validator'

export class UpdateSubscriptionDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  plan!: PlanType

  /** FREE only: end of the trial. null clears it. Omitted keeps the current value. */
  @ApiPropertyOptional({ nullable: true, example: '2026-11-20T00:00:00.000Z' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  trialEndsAt?: string | null

  /** PRO / ENTERPRISE: paid until this date (manual billing). null = no expiry. */
  @ApiPropertyOptional({ nullable: true, example: '2026-11-20T00:00:00.000Z' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  currentPeriodEnd?: string | null
}
