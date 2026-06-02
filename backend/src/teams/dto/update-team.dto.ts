import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { VolleyballRole } from '../../common/enums/volleyball-role.enum';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  season?: string;
}

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsEnum(VolleyballRole)
  role: VolleyballRole;

  @IsNumber()
  @IsOptional()
  jerseyNumber?: number;
}

export class UpdateMemberRoleDto {
  @IsEnum(VolleyballRole)
  @IsOptional()
  role?: VolleyballRole;
}

export class TransferCaptainDto {
  @IsString()
  userId: string;
}
