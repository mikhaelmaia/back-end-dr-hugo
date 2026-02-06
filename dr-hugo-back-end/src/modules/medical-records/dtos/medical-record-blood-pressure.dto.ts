import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';
import {
  provideIsStringValidationMessage,
  provideMaxLengthValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class MedicalRecordBloodPressureDto {
  @ApiProperty({
    description:
      'Valores usuais da pressão arterial do paciente (máximo 20 caracteres)',
    example: '120x80',
    required: false,
    maxLength: 20,
    type: String,
  })
  @IsString({
    message: provideIsStringValidationMessage('Pressão Arterial'),
  })
  @MaxLength(20, {
    message: provideMaxLengthValidationMessage('Pressão Arterial'),
  })
  @Expose()
  description?: string;
}
