import { IsOptional, IsUUID, IsDate } from 'class-validator';
import { BaseEntity } from './base.entity';
import { provideIsUUIDValidationMessage } from '../vo/consts/validation-messages';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntityDto<T extends BaseEntity> {
  @ApiProperty({
    description: 'Identificador UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: provideIsUUIDValidationMessage('ID') })
  @Expose()
  public id: string;

  @ApiProperty({ description: 'Timestamp de criação' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Expose()
  public createdAt: Date;

  @ApiProperty({ description: 'Timestamp da última atualização' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Expose()
  public updatedAt: Date;
}
