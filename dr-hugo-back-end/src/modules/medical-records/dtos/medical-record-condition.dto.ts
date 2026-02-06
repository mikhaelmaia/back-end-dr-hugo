import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, MaxLength, ValidateIf } from 'class-validator';
import { Expose } from 'class-transformer';
import {
  provideIsBooleanValidationMessage,
  provideIsStringValidationMessage,
  provideMaxLengthValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class MedicalRecordConditionDto {
  @ApiProperty({
    description: 'Indica se o paciente possui a condição médica específica',
    example: true,
    type: Boolean,
  })
  @IsBoolean({
    message: provideIsBooleanValidationMessage('Condição Médica'),
  })
  @Expose()
  hasCondition: boolean;

  @ApiProperty({
    description:
      'Descrição detalhada da condição médica (máximo 500 caracteres)',
    example: 'Alergia a dipirona e derivados, causa reações cutâneas',
    required: false,
    nullable: true,
    maxLength: 500,
    type: String,
  })
  @ValidateIf((o) => o.hasCondition === true)
  @IsString({
    message: provideIsStringValidationMessage('Descrição da Condição'),
  })
  @MaxLength(500, {
    message: provideMaxLengthValidationMessage('Descrição da Condição'),
  })
  @Expose()
  description?: string | null;
}
