import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUrl,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TournamentFormat, SkillLevel } from '../schemas/tournament.schema';

export class CreateTournamentDto {
  @IsString()
  name: string;

  @IsString()
  place: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString()
  dateTime: string;

  @IsNumber()
  @Min(2)
  maxTeamSlots: number;

  @IsEnum(TournamentFormat)
  @IsOptional()
  format?: TournamentFormat;

  @IsEnum(SkillLevel)
  @IsOptional()
  skillLevel?: SkillLevel;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => value || undefined)
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
