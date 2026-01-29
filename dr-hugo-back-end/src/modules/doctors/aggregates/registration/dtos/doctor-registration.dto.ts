import { IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { DoctorRegistration } from '../entities/doctor-registration.entity';
import {
  provideIsStringValidationMessage,
  provideIsEnumValidationMessage
} from 'src/core/vo/consts/validation-messages';
import { BrazilianState, DoctorRegistrationType, DoctorSituation } from 'src/core/vo/consts/enums';

export class DoctorRegistrationDto extends BaseEntityDto<DoctorRegistration> {
  @ApiProperty({
    description: 'Número do CRM do médico',
    example: '123456',
    maxLength: 20,
    type: String,
    required: false
  })
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('CRM') })
  @Expose()
  public crm?: string;

  @ApiProperty({
    description: 'Situação atual do registro do médico no CRM',
    enum: DoctorSituation,
    example: DoctorSituation.REGULAR,
    required: false
  })
  @IsOptional()
  @IsEnum(DoctorSituation, { message: (args) => provideIsEnumValidationMessage(args, DoctorSituation) })
  @Expose()
  public situation?: DoctorSituation;

  @ApiProperty({
    description: 'Tipo de registro do médico no CRM',
    enum: DoctorRegistrationType,
    example: DoctorRegistrationType.PRINCIPAL,
    required: false
  })
  @IsOptional()
  @IsEnum(DoctorRegistrationType, { message: (args) => provideIsEnumValidationMessage(args, DoctorRegistrationType) })
  @Expose()
  public type?: DoctorRegistrationType;

  @ApiProperty({
    description: 'Data da última atualização dos dados no CRM',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @IsDate({ message: 'Data de última atualização deve estar no formato de data válido' })
  @Type(() => Date)
  @Expose()
  public lastUpdate?: Date;

  @ApiProperty({
    description: 'Estado brasileiro onde o CRM foi emitido',
    enum: BrazilianState,
    example: BrazilianState.SP,
    required: false
  })
  @IsOptional()
  @IsEnum(BrazilianState, { message: (args) => provideIsEnumValidationMessage(args, BrazilianState) })
  @Expose()
  public state?: BrazilianState;
}