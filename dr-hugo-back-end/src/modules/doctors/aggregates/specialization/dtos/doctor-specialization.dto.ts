import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { DoctorSpecialization } from '../entities/doctor-specialization.entity';
import {
  provideIsStringValidationMessage,
  provideIsEnumValidationMessage,
  provideIsNotEmptyValidationMessage
} from 'src/core/vo/consts/validation-messages';
import { DoctorSpecializationType } from 'src/core/vo/consts/enums';

export class DoctorSpecializationDto extends BaseEntityDto<DoctorSpecialization> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Especialização'),
  })
  @IsEnum(DoctorSpecializationType, { message: (args) => provideIsEnumValidationMessage(args, DoctorSpecializationType) })
  @Expose()
  @ApiProperty({
    description: 'Tipo de especialização médica',
    enum: DoctorSpecializationType,
    example: DoctorSpecializationType.CARDIOLOGY
  })
  public name: DoctorSpecializationType;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('RQE'),
  })
  @IsString({ message: provideIsStringValidationMessage('RQE') })
  @Expose()
  @ApiProperty({
    description: 'Número do RQE (Registro de Qualificação de Especialista)',
    example: 'RQE12345',
    maxLength: 20,
    type: String
  })
  public rqe: string;
}