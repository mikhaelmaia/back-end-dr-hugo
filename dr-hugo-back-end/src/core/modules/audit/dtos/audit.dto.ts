import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../../../base/base.entity.dto';
import { AuditEventType } from '../../../vo/consts/enums';
import { Audit } from '../entities/audit.entity';
import { FingerprintResponseDto } from '../fingerprint/dtos/fingerprint-response.dto';
import { UserDto } from 'src/modules/users/dtos/user.dto';

export class AuditDto extends BaseEntityDto<Audit> {
  @ApiProperty({
    description: 'Tipo de evento de auditoria que foi registrado',
    example: 'CREATE',
    enum: AuditEventType,
    enumName: 'AuditEventType'
  })
  @IsNotEmpty()
  @IsEnum(AuditEventType)
  public eventType: AuditEventType;

  @ApiProperty({
    description: 'Nome da entidade que foi modificada na ação auditada',
    example: 'User',
    type: String
  })
  @IsNotEmpty()
  @IsString()
  public entityName: string;

  @ApiProperty({
    description: 'Identificador único da entidade que foi modificada (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    type: String
  })
  @IsNotEmpty()
  @IsString()
  public entityId: string;

  @ApiProperty({
    description: 'Dados completos da entidade no momento da ação auditada',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      role: 'PATIENT'
    },
    type: 'object',
    additionalProperties: true
  })
  @IsNotEmpty()
  @IsObject()
  public data: any;

  @ApiProperty({
    description: 'Usuário que executou a ação auditada',
    type: () => UserDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  public author: UserDto;

  @ApiProperty({
    description: 'Informações de fingerprint da sessão que executou a ação',
    type: () => FingerprintResponseDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FingerprintResponseDto)
  public fingerprint: FingerprintResponseDto;
}
