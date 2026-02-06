import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, ValidateIf, Max } from 'class-validator';
import { Expose } from 'class-transformer';
import {
  provideIsBooleanValidationMessage,
  provideIsNumberValidationMessage,
  provideMaxValidationMessage,
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
      'Quantidade de cigarros fumados por dia (máximo 999)',
    example: 20,
    required: false,
    maximum: 999,
    type: Number,
  })
  @ValidateIf((o) => o.isSmoker === true)
  @IsNumber({}, {
    message: provideIsNumberValidationMessage('Cigarros por Dia'),
  })
  @Max(999, {
    message: provideMaxValidationMessage('Cigarros por Dia', 999),
  })
  @Expose()
  cigarettesPerDay?: number;

  @ApiProperty({
    description: 'Há quantos anos o paciente fuma (máximo 150)',
    example: 10,
    required: false,
    maximum: 150, 
    type: Number,
  })
  @ValidateIf((o) => o.isSmoker === true)
  @IsNumber({}, {
    message: provideIsNumberValidationMessage('Anos Fumando'),
  })
  @Max(150, {
    message: provideMaxValidationMessage('Anos Fumando', 150),
  })
  @Expose()
  yearsSmoking?: number;
}
