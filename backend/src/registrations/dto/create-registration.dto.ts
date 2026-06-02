import { IsString, IsEnum, IsOptional } from 'class-validator';
import { RegistrationType, RegistrationStatus } from '../schemas/registration.schema';
import { VolleyballRole } from '../../common/enums/volleyball-role.enum';

export class CreateRegistrationDto {
  @IsString()
  tournamentId: string;

  @IsEnum(RegistrationType)
  type: RegistrationType;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsEnum(VolleyballRole)
  role: VolleyballRole;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;
}
