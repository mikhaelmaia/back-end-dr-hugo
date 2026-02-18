import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, ValidateIf, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';
import {
  provideIsBooleanValidationMessage,
  provideIsStringValidationMessage,
  provideMaxLengthValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class MedicalRecordPhysicalActivityDto {
  @ApiProperty({
    description:
      'Indica se o paciente pratica atividades físicas com regularidade',
    example: true,
    type: Boolean,
  })
  @IsBoolean({
    message: provideIsBooleanValidationMessage('Atividade Física'),
  })
  @Expose()
  hasPhysicalActivity: boolean;

  @ApiProperty({
    description:
      'Quais atividades físicas você pratica (máximo 500 caracteres)',
    example: 'Caminhada, natação, academia',
    required: false,
    maxLength: 500,
    type: String,
  })
  @ValidateIf((o) => o.hasPhysicalActivity === true)
  @IsString({
    message: provideIsStringValidationMessage('Tipos de Atividade Física'),
  })
  @MaxLength(500, {
    message: provideMaxLengthValidationMessage('Tipos de Atividade Física'),
  })
  @Expose()
  physicalActivityTypes?: string;

  @ApiProperty({
    description:
      'Quantas vezes por semana você pratica atividades físicas (máximo 50 caracteres)',
    example: '3 vezes por semana',
    required: false,
    maxLength: 50,
    type: String,
  })
  @ValidateIf((o) => o.hasPhysicalActivity === true)
  @IsString({
    message: provideIsStringValidationMessage('Frequência Semanal'),
  })
  @MaxLength(50, {
    message: provideMaxLengthValidationMessage('Frequência Semanal'),
  })
  @Expose()
  weeklyFrequency?: string;
}
