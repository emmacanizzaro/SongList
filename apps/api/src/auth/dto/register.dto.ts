import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Juan García" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: "juan@miglesia.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "MiPassword123!" })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: "Iglesia Casa de Gracia" })
  @ValidateIf((o) => !o.inviteToken)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  churchName?: string;

  @ApiProperty({ required: false, example: "4f5e8a..." })
  @IsOptional()
  @IsString()
  inviteToken?: string;
}
