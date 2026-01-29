import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { DoctorSpecialization } from '../entities/doctor-specialization.entity';
import {
  provideIsStringValidationMessage,
  provideIsEnumValidationMessage
} from 'src/core/vo/consts/validation-messages';
import { DoctorSpecializationType } from 'src/core/vo/consts/enums';

export class DoctorSpecializationDto extends BaseEntityDto<DoctorSpecialization> {
  @ApiProperty({
    description: 'Tipo de especialização médica',
    enum: DoctorSpecializationType,
    example: DoctorSpecializationType.CARDIOLOGY,
    required: false
  })
  @IsOptional()
  @IsEnum(DoctorSpecializationType, { message: (args) => provideIsEnumValidationMessage(args, DoctorSpecializationType) })
  @Expose()
  public name?: DoctorSpecializationType;

  @ApiProperty({
    description: 'Número do RQE (Registro de Qualificação de Especialista)',
    example: 'RQE12345',
    maxLength: 20,
    type: String,
    required: false
  })
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('RQE') })
  @Expose()
  public rqe?: string;
}