import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, ValidateIf, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';
import {
  provideIsBooleanValidationMessage,
  provideIsStringValidationMessage,
  provideMaxLengthValidationMessage,
} from 'src/core/vo/consts/validation-messages';

export class MedicalRecordSmokingDto {
  @ApiProperty({
    description: 'Indica se o paciente é fumante ou já foi fumante',
    example: true,
    type: Boolean,
  })
  @IsBoolean({
    message: provideIsBooleanValidationMessage('Fumante'),
  })
  @Expose()
  isSmoker: boolean;

  @ApiProperty({
    description:
      'Quantidade de cigarros fumados por dia (máximo 50 caracteres)',
    example: '20 cigarros',
    required: false,
    maxLength: 50,
    type: String,
  })
  @ValidateIf((o) => o.isSmoker === true)
  @IsString({
    message: provideIsStringValidationMessage('Cigarros por Dia'),
  })
  @MaxLength(50, {
    message: provideMaxLengthValidationMessage('Cigarros por Dia'),
  })
  @Expose()
  cigarettesPerDay?: string;

  @ApiProperty({
    description: 'Há quantos anos o paciente fuma (máximo 50 caracteres)',
    example: '10 anos',
    required: false,
    maxLength: 50,
    type: String,
  })
  @ValidateIf((o) => o.isSmoker === true)
  @IsString({
    message: provideIsStringValidationMessage('Anos Fumando'),
  })
  @MaxLength(50, {
    message: provideMaxLengthValidationMessage('Anos Fumando'),
  })
  @Expose()
  yearsSmoking?: string;
}
