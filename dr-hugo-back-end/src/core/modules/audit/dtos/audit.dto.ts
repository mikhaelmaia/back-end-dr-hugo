import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntityDto } from '../../../base/base.entity.dto';
import { AuditEventType } from '../../../vo/consts/enums';
import { Audit } from '../entities/audit.entity';
import { FingerprintResponseDto } from '../fingerprint/dtos/fingerprint-response.dto';
import { UserDto } from 'src/modules/users/dtos/user.dto';

export class AuditDto extends BaseEntityDto<Audit> {
  @IsNotEmpty()
  @IsEnum(AuditEventType)
  public eventType: AuditEventType;

  @IsNotEmpty()
  @IsString()
  public entityName: string;

  @IsNotEmpty()
  @IsString()
  public entityId: string;

  @IsNotEmpty()
  @IsObject()
  public data: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  public author: UserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FingerprintResponseDto)
  public fingerprint: FingerprintResponseDto;
}
