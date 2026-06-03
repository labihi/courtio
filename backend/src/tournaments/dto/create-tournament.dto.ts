import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TournamentFormat, SkillLevel } from '../schemas/tournament.schema';

export class PlaceDto {
  @IsString()
  placeName: string;

  @IsString()
  placeAddress: string;

  @IsUrl()
  @IsOptional()
  placeUrl?: string;
}

export class CreateTournamentDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => PlaceDto)
  place: PlaceDto;

  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString()
  dateTime: string;

  @IsDateString()
  @IsOptional()
  registrationCloseDateTime?: string;

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
