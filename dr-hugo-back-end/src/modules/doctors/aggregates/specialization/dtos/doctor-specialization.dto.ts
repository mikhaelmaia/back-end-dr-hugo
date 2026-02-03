import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { DoctorSpecialization } from '../entities/doctor-specialization.entity';
import {
  provideIsStringValidationMessage,
  provideIsEnumValidationMessage,
  provideIsNotEmptyValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { DoctorSpecializationType } from 'src/core/vo/consts/enums';
import { findEnumStringValueByKey } from 'src/core/utils/enum.utils';

export class DoctorSpecializationDto extends BaseEntityDto<DoctorSpecialization> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Especialização'),
  })
  @IsEnum(DoctorSpecializationType, {
    message: (args) =>
      provideIsEnumValidationMessage(args, DoctorSpecializationType),
  })
  @Expose()
  @Transform(
    ({ value }) =>
      value in DoctorSpecializationType
        ? DoctorSpecializationType[
            value as keyof typeof DoctorSpecializationType
          ]
        : value,
    { toPlainOnly: true },
  )
  @ApiProperty({
    description: 'Tipo de especialização médica',
    enum: DoctorSpecializationType,
    example: DoctorSpecializationType.CARDIOLOGY,
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
    type: String,
  })
  public rqe: string;
}
