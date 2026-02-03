import { IsString, IsEnum, IsDate, IsNotEmpty } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { DoctorRegistration } from '../entities/doctor-registration.entity';
import {
  provideIsStringValidationMessage,
  provideIsEnumValidationMessage,
  provideIsNotEmptyValidationMessage
} from 'src/core/vo/consts/validation-messages';
import { BrazilianState, DoctorRegistrationType, DoctorSituation } from 'src/core/vo/consts/enums';

export class DoctorRegistrationDto extends BaseEntityDto<DoctorRegistration> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CRM'),
  })
  @IsString({ message: provideIsStringValidationMessage('CRM') })
  @Expose()
  @ApiProperty({
    description: 'Número do CRM do médico',
    example: '123456',
    maxLength: 20,
    type: String
  })
  public crm: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Situação'),
  })
  @IsEnum(DoctorSituation, { message: (args) => provideIsEnumValidationMessage(args, DoctorSituation) })
  @Expose()
  @ApiProperty({
    description: 'Situação atual do registro do médico no CRM',
    enum: DoctorSituation,
    example: DoctorSituation.REGULAR
  })
  public situation: DoctorSituation;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tipo de Registro'),
  })
  @IsEnum(DoctorRegistrationType, { message: (args) => provideIsEnumValidationMessage(args, DoctorRegistrationType) })
  @Expose()
  @ApiProperty({
    description: 'Tipo de registro do médico no CRM',
    enum: DoctorRegistrationType,
    example: DoctorRegistrationType.PRINCIPAL
  })
  public type: DoctorRegistrationType;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Data de Última Atualização'),
  })
  @IsDate({ message: 'Data de última atualização deve estar no formato de data válido' })
  @Type(() => Date)
  @Expose()
  @ApiProperty({
    description: 'Data da última atualização dos dados no CRM',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time'
  })
  public lastUpdate: Date;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Estado'),
  })
  @IsEnum(BrazilianState, { message: (args) => provideIsEnumValidationMessage(args, BrazilianState) })
  @Expose()
  @ApiProperty({
    description: 'Estado brasileiro onde o CRM foi emitido',
    enum: BrazilianState,
    example: BrazilianState.SP
  })
  public state: BrazilianState;
}