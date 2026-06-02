import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { VolleyballRole } from '../../common/enums/volleyball-role.enum';
import { PlatformRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(PlatformRole)
  @IsOptional()
  platformRole?: PlatformRole;

  @IsArray()
  @IsEnum(VolleyballRole, { each: true })
  @IsOptional()
  volleyballRoles?: VolleyballRole[];
}
