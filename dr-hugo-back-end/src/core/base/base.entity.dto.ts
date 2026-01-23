import { IsOptional, IsUUID, IsDate } from 'class-validator';
import { BaseEntity } from './base.entity';
import { provideIsUUIDValidationMessage } from '../vo/consts/validation-messages';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntityDto<T extends BaseEntity> {
  @ApiProperty({
    description: 'Identificador único universal da entidade (UUID versão 4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
    type: String
  })
  @IsOptional()
  @IsUUID(4, { message: provideIsUUIDValidationMessage('ID') })
  @Expose()
  public id: string;

  @ApiProperty({ 
    description: 'Data e hora de criação do registro no banco de dados (ISO 8601)',
    example: '2026-01-23T10:30:00.000Z',
    format: 'date-time',
    type: String
  })
  @Transform(({ value }) => new Date(value), { toPlainOnly: true })
  @Expose()
  public createdAt: Date;

  @ApiProperty({ 
    description: 'Data e hora da última atualização do registro (ISO 8601)',
    example: '2026-01-23T15:45:30.000Z',
    format: 'date-time',
    type: String
  })
  @Transform(({ value }) => new Date(value), { toPlainOnly: true })
  @Expose()
  public updatedAt: Date;
}
