import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';

class PushKeysDto {
  @IsString()
  @IsNotEmpty()
  auth: string;

  @IsString()
  @IsNotEmpty()
  p256dh: string;
}

export class PushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}
