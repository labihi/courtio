import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTournamentDto } from './create-tournament.dto';
import { TournamentStatus } from '../schemas/tournament.schema';

export class UpdateTournamentDto extends PartialType(CreateTournamentDto) {
  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;
}
